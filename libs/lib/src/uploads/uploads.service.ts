import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class UploadsService {
  private S3: S3Client;

  constructor(private configService: ConfigService) {
    const params = {
      region: this.configService.get<string>("AWS_BUCKET_REGION"),
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY"),
        secretAccessKey: this.configService.get<string>("AWS_SECRET_KEY"),
      },
    };

    this.S3 = new S3Client({ ...params });
  }

  async uploadToS3(file: any, folderName: string, useDateKey?: boolean) {
    const bucket = this.configService.get<string>("AWS_BUCKET_NAME");
    const key = useDateKey
      ? `${folderName}/${Date.now()}_${file.originalname}`
      : `${folderName}/${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
    });

    try {
      const [res, region] = await Promise.all([
        this.S3.send(command),
        this.S3.config.region(),
      ]);

      const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      return url;
    } catch (error) {
      console.log("Error", error);
    }
  }
}
