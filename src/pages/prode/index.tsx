import { useEffect, useState } from "react";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { Country, Group, Match, User, Vote } from "@prisma/client";
import { prisma } from "../../server/db/client";
import { verifyUserToken } from "../../utils/jwt";
import { trpc } from "../../utils/trpc";
import { Layout } from "../../components/Layout";
import { CurrentMatch } from "../../components/CurrentMatch";
import { useRouter } from "next/router";

export type MatchWithCountry = Match & {
  country1: Country | null;
  country2: Country | null;
};

interface Props {
  votes: Vote[];
  user: User;
  matches: MatchWithCountry[];
  matchesByGroup: Record<Group | "K", MatchWithCountry[]>;
  countries: Country[];
  countriesByGroup: Record<Group, Country[]>;
  initialPointsMap: Record<string, number>;
}

const Prode: NextPage<Props> = (props) => {
  const [points, setPoints] = useState(props.initialPointsMap);
  const [votes, setVotes] = useState<
    Record<string, Omit<Vote, "userId" | "id">>
  >({});
  const [selected, setSelected] = useState<MatchWithCountry>();

  const { mutate, data, isError, isLoading } = trpc.votes.castVotes.useMutation();

  const router = useRouter();

  useEffect(() => {
    if (data?.count) {
      router.push("/leaderboard");
    }
    if (isError) {
      alert("Ocurrio un error D:");
    }
  }, [data, isError]);

  return (
    <Layout>
      {selected && (
        <CurrentMatch
          match={selected}
          setPoints={setPoints}
          setVotes={setVotes}
          votes={votes}
        />
      )}
      <div className="grid w-full gap-2 sm:grid-cols-1 md:grid-cols-4">
        {Object.keys(props.countriesByGroup).map((group) => (
          <div
            className="rounded-md border border-solid border-white p-3 text-gray-300"
            key={group}
          >
            <div className="flex items-center justify-between">
              <h6 className="mb-5 px-2">Grupo {group}</h6>
            </div>
            {props.countriesByGroup[group as Group]
              .sort((c1, c2) => points[c2.name]! - points[c1.name]!)
              .map((country) => (
                <div
                  className="flex items-center justify-between px-2"
                  key={country.id}
                >
                  <div className="flex items-center">
                    <Image
                      src={`https://www.worldometers.info/img/flags/${country.flagCode}-flag.gif`}
                      height="20px"
                      width="20px"
                      className="rounded-full"
                    />

                    <div className="ml-2">{country.name}</div>
                  </div>
                  <span>{Math.floor(points[country.name]!)} PTS</span>
                </div>
              ))}
            <div className="mt-5 w-full px-2">
              {props.matchesByGroup[group as Group].map((match) => (
                <div
                  key={match.id}
                  className={`my-1 flex cursor-pointer items-center justify-between ${
                    votes[match.id] ? "bg-black bg-opacity-10" : ""
                  } transition-all hover:bg-black hover:bg-opacity-10`}
                  onClick={() => setSelected(match)}
                >
                  <Image
                    src={`https://www.worldometers.info/img/flags/${
                      match.country1!.flagCode
                    }-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                  <span>vs</span>
                  <Image
                    src={`https://www.worldometers.info/img/flags/${
                      match.country2!.flagCode
                    }-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {Object.keys(votes).length == 48 && (
        <button
          className="mt-4 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-xl text-gray-300 transition-[color,box-shadow] duration-[400ms,700ms] hover:text-gray-300 hover:shadow-[inset_13rem_0_0_0] hover:shadow-blue-500"
          onClick={() => mutate(Object.values(votes))}
          disabled={isLoading || !!data?.count}
        >
          {isLoading ? "Cargando..." : "Confirmar Resultados"}
        </button>
      )}
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

  const votes = await prisma.vote.findMany({
    where: { userId: user.id },
  });

  console.log(user)

  if(votes.length >= 48) {
    return {
      redirect: {
        destination: '/leaderboard',
        permanent: false,
      }
    }
  }

  const matches = await prisma.match.findMany({
    orderBy: {
      group: "asc",
    },
    include: {
      country1: true,
      country2: true,
    },
  });

  const matchesByGroup = matches.reduce(
    (prev, match) => ({
      ...prev,
      [match.group || "K"]: [...(prev[match.group || "K"] || []), match],
    }),
    {} as Record<Group | "K", MatchWithCountry[]>
  );

  const countries = await prisma.country.findMany({
    orderBy: { group: "asc" },
  });
  const countriesByGroup = countries.reduce((prev, country) => {
    return {
      ...prev,
      [country.group]: [...(prev[country.group] || []), country],
    };
  }, {} as Record<Group, Country[]>);

  const initialPointsMap = Object.fromEntries(
    countries.map((country) => [country.name, 0])
  );

  return {
    props: {
      user,
      votes,
      countries,
      matches,
      countriesByGroup,
      matchesByGroup,
      initialPointsMap,
    },
  };
};

export default Prode;
