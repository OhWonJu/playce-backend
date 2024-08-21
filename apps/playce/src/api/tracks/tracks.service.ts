import { Injectable } from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { join } from "path";
import { promises as fs } from "fs";

import { TrackService } from "@lib/crud/track/track.service";
import { CreateTrackDTO } from "@lib/crud/track/dto/createTrack.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { UploadsService } from "@lib/uploads/uploads.service";
import { Track } from "@prisma/client";

@Injectable()
export class TracksService {
  constructor(
    private trackService: TrackService,
    private uploadsService: UploadsService,
  ) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    ffmpeg.setFfprobePath(ffprobeInstaller.path);
  }

  async convertToHLS(
    inputFilePath: string,
    outputDir: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .setFfmpegPath(ffmpegInstaller.path)
        .outputOptions([
          "-hls_time 30", // 각 .ts 파일의 길이
          "-hls_list_size 0", // 목록에 모든 ts 파일 포함
          "-f hls", // HLS 형식으로 출력
        ])
        .output(join(outputDir, "output.m3u8"))
        .on("end", () => resolve(outputDir))
        .on("error", reject)
        .run();
    });
  }

  async getDuration(inputFilePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputFilePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        if (metadata && metadata.format && metadata.format.duration) {
          resolve(metadata.format.duration);
        } else {
          reject(new Error("Duration not found in metadata"));
        }
      });
    });
  }

  // m3u8 및 .ts 파일을 S3에 업로드하는 함수
  async uploadHLSToS3(
    folderName: string,
    hlsDirectory: string,
  ): Promise<string[]> {
    const files = await fs.readdir(hlsDirectory);

    // 각 파일을 S3에 업로드
    const uploadPromises = files.map(async (file) => {
      const filePath = join(hlsDirectory, file); //
      const fileBuffer = await fs.readFile(filePath);

      const s3Key = `${folderName}/output`; // S3에서의 파일 경로

      return this.uploadsService.uploadToS3(
        { buffer: fileBuffer, originalname: file },
        s3Key,
        false,
      );
    });

    return Promise.all(uploadPromises);
  }

  async extractWaveform(
    inputFilePath: string,
    downsampleFactor = 4400,
  ): Promise<number[]> {
    const tempPCMPath = join(__dirname, "../../temp", "output.pcm");

    // 1. ffmpeg를 사용하여 오디오를 PCM 데이터로 변환
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputFilePath)
        .outputOptions([
          "-f s16le", // RAW PCM 데이터로 출력
          "-acodec pcm_s16le", // 16-bit little-endian PCM
          "-ac 1", // Mono 채널 (스테레오의 경우 2로 설정)
          "-ar 44100", // 샘플링 레이트
        ])
        .output(tempPCMPath)
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    });

    // 2. PCM 파일을 읽고 부동소수점 배열로 변환
    const pcmData = await fs.readFile(tempPCMPath);
    const waveform = [];

    for (let i = 0; i < pcmData.length; i += 2 * downsampleFactor) {
      const int16Sample = pcmData.readInt16LE(i);
      waveform.push(int16Sample / 32768); // -1.0 ~ 1.0 범위로 정규화
    }

    // 임시 PCM 파일 삭제
    await fs.unlink(tempPCMPath);

    return waveform;
  }

  async createTrack(
    file: any,
    createTrackDTO: CreateTrackDTO,
  ): Promise<MutationResponse> {
    const { artistName, albumName } = createTrackDTO;

    const fileName: string = file.originalname.split(".")[0];

    const folderName = `artist/${artistName}/${albumName}/tracks/${fileName}`;

    await this.uploadsService.uploadToS3(file, folderName, false);

    // 임시 디렉토리에 파일 저장
    const tempDir = join(__dirname, "../../temp");
    await fs.mkdir(tempDir, { recursive: true });
    const inputFilePath = join(tempDir, file.originalname);
    await fs.writeFile(inputFilePath, file.buffer);

    // mp3 파일을 HLS 형식으로 변환
    const hlsOutputDir = join(tempDir, "output");
    await fs.mkdir(hlsOutputDir, { recursive: true });
    await this.convertToHLS(inputFilePath, hlsOutputDir);

    // 변환된 파일들을 S3에 업로드
    const s3Urls = await this.uploadHLSToS3(folderName, hlsOutputDir);

    // S3 URL 저장
    createTrackDTO.trackURL = s3Urls.find((url) => url.endsWith(".m3u8")) || "";

    const duration = await this.getDuration(inputFilePath);
    createTrackDTO.trackTime = Math.floor(duration);

    const waveform = await this.extractWaveform(inputFilePath);
    createTrackDTO.peaks = waveform;

    await fs.rm(tempDir, { recursive: true, force: true });

    return await this.trackService.createTrack(createTrackDTO);
  }

  async getTrackInfo(trackId: string): Promise<Track | undefined> {
    return await this.trackService.getTrack(trackId);
  }
}
