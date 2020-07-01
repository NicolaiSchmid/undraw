import fetch from "node-fetch";
import qs from "qs";
import camelcase from "camelcase";
import { existsSync } from "fs";
import { stats, mkdir, writeFile } from "fs/promises";

function prepareObject(illustrations) {
  const obj = {};
  illustrations.forEach((ill) => {
    obj[camelcase(ill.title)] = ill.image;
  });

  return obj;
}

function buildTypescript(images) {
  return `
declare module '@nicolaischmid/undraw' {
${Object.keys(images)
  .map((key) => `export const ${key}: string;`)
  .join("  \n")}
}`;
}

async function write(images) {
  const dir = "./dist";

  if (!existsSync(dir)) {
    await mkdir(dir);
  }

  await writeFile(`${dir}/index.json`, JSON.stringify(images));
  await writeFile(`${dir}/index.d.ts`, buildTypescript(images));

  await Promise.all(
    Object.keys(images).map(async (key) => {
      return writeFile(
        `${dir}/${key}.js`,
        `module.exports = "${images[key]}";`
      );
    })
  );
}

const sanitization = [
  {
    key: "void",
    replace: "Void",
  },
  {
    key: "3DModeling",
    replace: "modeling3d",
  },
];

function sanitize(images) {
  const obj = {};

  Object.keys(images).map((key) => {
    const san = sanitization.filter((san) => san.key === key)[0];

    if (san) {
      obj[san.replace] = images[key];
      return;
    }

    obj[key] = images[key];
  });

  return obj;
}

const query = async (page) => {
  const response = await fetch(
    `https://undraw.co/api/illustrations?${qs.stringify({ page })}`
  ).then((res) => res.json());

  if (!response.hasMore) return prepareObject(response.illustrations);

  return {
    ...prepareObject(response.illustrations),
    ...(await query(response.nextPage)),
  };
};

(async () => {
  const images = sanitize(await query(1));
  console.log(images);
  await write(images);
})();
