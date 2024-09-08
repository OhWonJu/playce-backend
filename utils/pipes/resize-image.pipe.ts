import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import sharp from "sharp";

const WIDTHS = [200, 400, 800];
const WEBP_FORMAT = "webp";

@Injectable()
export class ResizeImagePipe implements PipeTransform {
  isSingleFile(value: any): value is Express.Multer.File {
    return value && "fieldname" in value && "originalname" in value;
  }

  async transform(value, metadata: ArgumentMetadata) {
    if (!this.isSingleFile(value)) {
      const result = { ...value };
      const keys = Object.keys(value);

      for (const key of keys) {
        const filetype = value[key][0].mimetype.split("/");

        if (filetype[0] === "image") {
          result[key][0] = await this.generateResizedImages(value[key][0]);
        }
      }

      return result;
    }

    const filetype = value.mimetype.split("/");
    if (filetype[0] === "image") {
      value = await this.generateResizedImages(value);
    }
    return value;
  }

  async generateResizedImages(value: Express.Multer.File) {
    // Determine if the image is already in WebP format
    const isWebp = value.mimetype === `image/${WEBP_FORMAT}`;

    // Store the resized images
    const resizedImages = {};

    for (const width of WIDTHS) {
      const resizedBuffer = await this.resizeAndConvertImage(
        value.buffer,
        width,
        isWebp,
      );
      resizedImages[`${width}w`] = {
        ...value,
        buffer: resizedBuffer,
        originalname: this.addSuffixToFilename(
          value.originalname,
          `${width}w`,
          isWebp,
        ),
        mimetype: `image/${WEBP_FORMAT}`, // Set the MIME type to WebP
      };
    }

    return resizedImages;
  }

  async resizeAndConvertImage(buffer: Buffer, width: number, isWebp: boolean) {
    const transformer = sharp(buffer).resize({ width });
    if (!isWebp) {
      transformer.toFormat(WEBP_FORMAT); // Convert to WebP if not already WebP
    }
    return transformer.toBuffer();
  }

  addSuffixToFilename(
    filename: string,
    suffix: string,
    isWebp: boolean,
  ): string {
    const dotIndex = filename.lastIndexOf(".");
    const name = filename.substring(0, dotIndex);
    const extension = isWebp ? ".webp" : filename.substring(dotIndex); // Use .webp for new format
    return `${name}_${suffix}${extension}`;
  }
}
