// import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
// import { ctx } from "../ctx";

// const base64ToBlob = async (base64: string) => {
//   const binary = atob(base64.split(",")[1]);
//   const imgBlob = await fetch(binary).then((res) => {
//     let blob;
//     blob = res.blob();
//     return blob;
//   });
//   console.log({imgBlob})
//   return imgBlob;
// };

// const uploadBlobAndGetImageURL = async (blob: Blob, blobName: string) => {
//   const storageRef = ref(ctx.storage, `/rooms/${blobName}`);
//   try {
//     const snapshot = await uploadBytes(storageRef, blob);
//     const downloadURL = await getDownloadURL(snapshot.ref);
//     return downloadURL;
//   } catch (err) {
//     throw err;
//   }
// };

// export const getImageURLSForBase64 = async (
//   base64Strings: string[],
//   fileNames: string[]
// ) => {  
//   const promises = [];
//   for (let i = 0; i < base64Strings.length; i++) {
//     const blob = await base64ToBlob(base64Strings[i]);
//     const fileName = fileNames[i];
//     const promise = uploadBlobAndGetImageURL(blob, fileName);
//     promises.push(promise);
//   }
//   const imageURLs = await Promise.all(promises);
//   return imageURLs;
// };
