import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV_VARS } from "../../env";
import { ctx } from "../ctx";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type Files = {
  fieldname: string;
  originalName: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer | undefined;
  path?: string | undefined;
  destination?: string | undefined;
  filename?: string | undefined;
}[];

export const getFileUploadPromisesAndFileLinks = (
  files: Files,
  name: string
) => {
  let filePromises = [];
  let fileLinks: string[] = [];
  let fileNames: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const filePromise = new Promise(async (resolve, reject) => {
      try {
        const fileName = `${name}-${i}-${Date.now()}`;
        fileNames.push(fileName);
        const params = {
          Bucket: ENV_VARS.STORAGE_BUCKET,
          Key: fileName,
          Body: files[i].buffer,
          ContentType: files[i].mimetype,
        };
        const command = new PutObjectCommand(params);
        await ctx.storage.send(command);

        const url = await getSignedUrl(
          ctx.storage,
          new PutObjectCommand({
            Bucket: ENV_VARS.STORAGE_BUCKET,
            Key: fileName,
          })
        );
        fileLinks.push(url);
        resolve(files[i]);
      } catch (err) {
        reject(err);
      }
    });
    filePromises.push(filePromise);
  }
  return { filePromises, fileLinks, fileNames };
};

export const uploadFilesAndGetLinks = async (files: Files, name: string) => {
  const { fileLinks, filePromises, fileNames } = getFileUploadPromisesAndFileLinks(
    files,
    name
  );
  await Promise.all(filePromises);
  return { fileLinks, fileNames };
};
