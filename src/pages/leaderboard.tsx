import { Layout } from "../components/Layout";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { verifyUserToken } from "../utils/jwt";

const Leaderboard = () => {
  const { data: users } = trpc.votes.getLeaderboard.useQuery();

  return (
    <Layout>
      <h1 className="text-4xl font-bold text-gray-300">Leaderboard</h1>
      <div className="mt-2 w-4/5 rounded-lg border border-gray-300">
        {users?.map((user, i) => (
          <Link href={`/prode/${user.name}`} passHref prefetch={true} key={user.id}>
            <a
              className="flex cursor-pointer items-center justify-between border-b border-gray-300 px-10 py-2 text-gray-300 transition-all hover:bg-black hover:bg-opacity-10"
            >
              <p>
                {i + 1}. {user.name}
              </p>
              <p>{user.points} PTS</p>
            </a>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await verifyUserToken(req.cookies.token || "");

  if (!user)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

    console.log(user)
  return {
    props: {},
  };
};

export default Leaderboard;
