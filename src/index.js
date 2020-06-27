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

function individualFile() {}

async function write(images) {
  const dir = "./dist";

  if (!existsSync(dir)) {
    await mkdir(dir);
  }

  await writeFile(`${dir}/index.json`, JSON.stringify(images));

  await Promise.all(
    Object.keys(images).map(async (key) => {
      return writeFile(
        `${dir}/${key}.js`,
        `module.exports = "${images[key]}";`
      );
    })
  );
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
  const images = await query(1);
  console.log(images);
  await write(images);
})();
