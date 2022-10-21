import { Layout } from "../components/Layout";
import { GetServerSideProps, NextPage } from "next";
import { prisma } from "../server/db/client";
import { verifyUserToken } from "../utils/jwt";
import { Country, Group, Match, User, Vote } from "@prisma/client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { CurrentMatch } from "../components/CurrentMatch";
import { Tiebreak } from "../components/Tiebreak";
import { trpc } from "../utils/trpc";

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

  const [tiebreakCountries, setTiebreakCountries] = useState<Country[]>([]);

  const { mutate, data, error } = trpc.votes.castVotes.useMutation()

  const checkForRepeats = useCallback(
    (group: Group): Country[] | null => {
      if (props.matchesByGroup[group].some((match) => !votes[match.id])) {
        return null;
      }

      const groupCountries = props.countriesByGroup[group];
      const hash = new Map<number, Country[]>();
      for (const country of groupCountries) {
        hash.set(points[country.name]!, [
          ...(hash.get(points[country.name]!) || []),
          country,
        ]);
      }
      let returnType: Country[] | null = null;
      hash.forEach((value, key) => {
        if (value.length > 1) {
          let larger = 0;
          hash.forEach((_, key2) => {
            if (key2 > key) larger++;
          });
          if (larger < 2) {
            returnType = value;
          }
        }
      });
      return returnType;
    },
    [props.countriesByGroup, points, votes]
  );

  return (
    <Layout>
      {selected && !tiebreakCountries.length && (
        <CurrentMatch
          match={selected}
          setPoints={setPoints}
          setVotes={setVotes}
          votes={votes}
        />
      )}
      {!!tiebreakCountries.length && (
        <Tiebreak
          countries={tiebreakCountries}
          setPoints={setPoints}
          setTiebreakCountries={setTiebreakCountries}
        />
      )

      }
      <div className="grid w-full md:grid-cols-4 gap-2 sm:grid-cols-1">
        {Object.keys(props.countriesByGroup).map((group) => (
          <div
            className="rounded-md border border-solid border-white p-3 text-gray-300"
            key={group}
          >
            <div className="flex items-center justify-between">
              <h6 className="mb-5 px-2">Grupo {group}</h6>
              {checkForRepeats(group as Group) && (
                <button
                  className="relative bottom-1 left-1 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-xs text-gray-300 transition-[color,box-shadow] duration-[400ms,700ms] hover:text-gray-300 hover:shadow-[inset_13rem_0_0_0] hover:shadow-blue-500"
                  onClick={() =>
                    setTiebreakCountries(checkForRepeats(group as Group)!)
                  }
                >
                  Desempatar
                </button>
              )}
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
      {Object.keys(votes).length >= 48 && (
        <button
        className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 mt-4 text-xl text-gray-300 transition-[color,box-shadow] duration-[400ms,700ms] hover:text-gray-300 hover:shadow-[inset_13rem_0_0_0] hover:shadow-blue-500"
        onClick={() => mutate(Object.values(votes))}
      >
        Confirmar Resultados
      </button>
      )
      }
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

  const matches = await prisma.match.findMany({
    orderBy: {
      group: "asc",
    },
    include: {
      country1: true,
      country2: true,
    },
  });

  const matchesByGroup = matches.reduce((prev, match) => {
    if (match.group) {
      return {
        ...prev,
        [match.group]: [...(prev[match.group] || []), match],
      };
    }
    return {
      ...prev,
      K: [...(prev.K || []), match],
    };
  }, {} as Record<Group | "K", MatchWithCountry[]>);

  const countries = await prisma.country.findMany({
    orderBy: {
      group: "asc",
    },
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
