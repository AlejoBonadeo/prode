import { useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { Vote, Country, Group, Result } from "@prisma/client";
import { prisma } from "../../server/db/client";
import { CurrentMatch, pointsToSum } from "../../components/CurrentMatch";
import { MatchWithCountry } from ".";
import { Layout } from "../../components/Layout";
import { verifyUserToken } from "../../utils/jwt";

export interface MatchWithCountryAndResult extends MatchWithCountry {
  result: Result | null;
}

interface Props {
  votes: Vote[];
  matchesByGroup: Record<Group | "K", MatchWithCountryAndResult[]>;
  countries: Country[];
  countriesByGroup: Record<Group, Country[]>;
  initialPointsMap: Record<string, number>;
  votesByMatch: Record<string, Vote>;
}

const UserProde: NextPage<Props> = (props) => {
  const [selected, setSelected] = useState<MatchWithCountryAndResult>();

  return (
    <Layout>
      {selected && (
        <CurrentMatch
          readonly
          match={selected}
          votes={{}}
          setPoints={() => {console.log('')}}
          setVotes={() => {console.log('')}}
          result={props.votes.find((v) => v.matchId === selected.id)?.result}
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
              .sort(
                (c1, c2) =>
                  props.initialPointsMap[c2.name]! -
                  props.initialPointsMap[c1.name]!
              )
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
                  <span>
                    {Math.floor(props.initialPointsMap[country.name]!)} PTS
                  </span>
                </div>
              ))}
            <div className="mt-5 w-full px-2">
              {props.matchesByGroup[group as Group].map((match) => {
                const prediction = props.votesByMatch[match.id]!.result;
                return (
                  <div
                    key={match.id}
                    className={`my-1 flex cursor-pointer items-center justify-between ${
                      selected?.id === match.id
                        ? match.result
                          ? match.result.result === prediction
                            ? "bg-green-400 bg-opacity-10"
                            : "bg-red-400 bg-opacity-10"
                          : "bg-black bg-opacity-10"
                        : match.result
                        ? match.result.result === prediction
                          ? "bg-green-400 bg-opacity-50"
                          : "bg-red-400 bg-opacity-50"
                        : ""
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
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const user = await verifyUserToken(req.cookies.token || "");

  if (!user)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  const { name = "" } = params!;

  if (!name || typeof name !== "string") {
    return {
      redirect: {
        destination: "/leaderboard",
        permanent: false,
      },
    };
  }

  const votes = await prisma.vote.findMany({
    where: { User: { name } },
    include: { country1: true, country2: true },
  });

  if (votes.length < 48) {
    if (user.name === name) {
      return {
        redirect: {
          destination: "/prode",
          permanent: false,
        },
      };
    }
    return {
      redirect: {
        destination: "/leaderboard",
        permanent: false,
      },
    };
  }
  const countries = await prisma.country.findMany({
    orderBy: { group: "asc" },
  });

  const countriesByGroup = countries.reduce((prev, country) => {
    return {
      ...prev,
      [country.group]: [...(prev[country.group] || []), country],
    };
  }, {} as Record<Group, Country[]>);
  let initialPointsMap = Object.fromEntries(
    countries.map((country) => [country.name, 0])
  );

  for (const vote of votes) {
    initialPointsMap = {
      ...initialPointsMap,
      [vote.country1.name]:
        initialPointsMap[vote.country1.name]! + pointsToSum[vote.result][0],
      [vote.country2.name]:
        initialPointsMap[vote.country2.name]! + pointsToSum[vote.result][1],
    };
  }

  const matches = await prisma.match.findMany({
    include: { country1: true, country2: true, result: true },
  });

  const matchesByGroup = matches.reduce(
    (prev, match) => ({
      ...prev,
      [match.group || "K"]: [...(prev[match.group || "K"] || []), match],
    }),
    {} as Record<Group | "K", MatchWithCountryAndResult[]>
  );

  const votesByMatch = votes.reduce(
    (prev, vote) => ({
      ...prev,
      [vote.matchId]: vote,
    }),
    {} as Record<string, Vote>
  );

  return {
    props: {
      countries,
      votes,
      initialPointsMap,
      matchesByGroup,
      countriesByGroup,
      votesByMatch,
    },
  };
};

export default UserProde;
