import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';

import { imageService } from "@services/db/image.service";
import { IFileImageDocument } from "@images/interfaces/image.interface";

export class Get {
  public async images(req: Request, res: Response): Promise<void> {
    const images: IFileImageDocument[] = await imageService.getImages(req.params.userId);
    res.status(HTTP_STATUS.OK).json({ message: 'Images fetched successfully', images });
  }
}