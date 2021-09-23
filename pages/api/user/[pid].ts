import { connectToDatabase } from "database/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const { pid } = req.query;

  if (req.method === "GET") {
    if (typeof pid === "string") {
      let user = await db
        .collection("users")
        .findOne({ [pid]: req.headers.body });
      res.json(user);
    }
  }
  if (req.method === "POST") {
    if (typeof pid === "string" && pid === "update") {
      const { email, name, image } = JSON.parse(req.body);
      const filter = {
        email: email,
      };

      let stringifiedImage = JSON.stringify(image.split(",")[1]);

      let headersList = {
        Accept: "*/*",
        Authorization: "Client-ID 1a01fef28b385f9",
      };

      let imgurImage = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        body: stringifiedImage,
        headers: headersList,
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (jsonified) {
          return jsonified.data.link;
        });

      const updateDocument = {
        $set: {
          name: name,
          image: imgurImage,
        },
      };
      let user = await db
        .collection("users")
        .findOneAndUpdate(filter, updateDocument, { returnDocument: "after" })
        .then((res: any) => res);

      res.json(user.value);
    }
    if (typeof pid === "string" && pid === "testing") {
      console.log(req);
      res.json(req);
    }
  }
};
