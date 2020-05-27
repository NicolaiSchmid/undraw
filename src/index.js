import fetch from "node-fetch";
import qs from "qs";

const query = async (page) => {
  const response = await fetch(
    `https://undraw.co/api/illustrations?${qs.stringify({ page })}`
  ).then((res) => res.json());

  response.illustrations.map((ill) => process.stdout.write(`${ill.image}\n`));

  if (!response.hasMore) return response.illustrations;

  return [...response.illustrations, ...(await query(response.nextPage))];
};

query(1);
