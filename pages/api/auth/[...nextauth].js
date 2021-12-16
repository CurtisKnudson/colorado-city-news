import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { connectToDatabase } from "@database/mongodb";
import { ObjectId } from "mongodb";
import { makeId } from "@utils/makeId";
import { v4 as uuidv4 } from "uuid";

export default async function auth(req, res) {
  let { db } = await connectToDatabase();
  return await NextAuth(req, res, {
    providers: [
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        },
        from: process.env.EMAIL_FROM,
      }),
    ],
    adapter: MongoDBAdapter({
      db: () => {
        return db;
      },
      ObjectId: ObjectId,
    }),
    session: {
      jwt: true,
    },
    callbacks: {
      // async signIn({ user, email }) {
      //   if (email.verificationRequest) {
      //     return true;
      //   }
      //   if (user.profileUrl) {
      //     return true;
      //   }

      //   const filter = {
      //     email: user.email,
      //   };
      //   const updateDocument = {
      //     $set: {
      //       test: "test",
      //     },
      //   };
      //   const test = await db
      //     .collection("users")
      //     .findOneAndUpdate(filter, updateDocument, {
      //       returnDocument: "after",
      //     });

      //   return true;
      // },
      async session({ session }) {
        const query = { email: session.user.email };
        const profileUrl = makeId();
        const id = uuidv4();

        const options = {
          projection: {
            profileUrl: 1,
            userId: 1,
            name: 1,
            image: 1,
          },
        };

        const updateDocument = {
          $set: {
            profileUrl,
            userId: id,
          },
        };

        const dbUser = await db.collection("users").findOne(query, options);

        if (!dbUser.profileUrl) {
          const dbUser = await db
            .collection("users")
            .findOneAndUpdate(query, updateDocument, {
              returnDocument: "after",
            });
          console.log(dbUser);

          return {
            ...session,
            user: {
              ...session.user,
              profileUrl: dbUser.profileUrl,
              userId: dbUser.userId,
              name: dbUser.name,
              image: dbUser.image,
            },
          };
        }

        return {
          ...session,
          user: {
            ...session.user,
            profileUrl: dbUser.profileUrl,
            userId: dbUser.userId,
            name: dbUser.name,
            image: dbUser.image,
          },
        };
      },
    },
    theme: "auto",
    debug: true,
  });
}
