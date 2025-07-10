import type { ImageData } from "./interface";
import type { DocumentData } from "firebase/firestore";

function onTop(param: any) {
  window.scrollTo({
    top: 0,
    behavior: param,
  });
}

const convertToImageData = (docData: DocumentData): ImageData => {
  return {
    name: docData.name || "",
    largeURL: docData.images[0] || "",
    thumbnailURL: docData.images[0] || "",
    widthOrigin: docData.widthOrigin || null,
    heightOrigin: docData.heightOrigin || null,
    description: docData.description || null,
    client: docData.client || null,
    year: docData.year || null,
    type: docData.type || null,
    size: docData.size || null,
    is360: docData.is360 || null,
    isAnimation: docData.isAnimation || null,
  };
};

export { onTop, convertToImageData };
