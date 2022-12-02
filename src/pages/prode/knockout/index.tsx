import { Country } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout } from "../../../components/Layout";
import { prisma } from "../../../server/db/client";
import { verifyUserToken } from "../../../utils/jwt";
import { trpc } from "../../../utils/trpc";
import { MatchWithCountry } from "../index";

interface Props {
  matches: MatchWithCountry[];
}

const Knockout: NextPage<Props> = (props) => {
  const [quarters, setQuarters] = useState<(Country | undefined)[]>([]);
  const [semis, setSemis] = useState<(Country | undefined)[]>([]);
  const [final, setFinal] = useState<(Country | undefined)[]>([]);
  const [thirdPlace, setThirdPlace] = useState<(Country | undefined)[]>([]);
  const [lastStageWinners, setLastStageWinners] = useState<
    [0 | 1 | undefined, 0 | 1 | undefined]
  >([undefined, undefined]);

  const { mutate, data, isLoading } =
    trpc.votes.castKnockoutVotes.useMutation();

  const router = useRouter()

  useEffect(() => {
    if(data === true) {
      router.push('/leaderboard')
    } 
  }, [data])
    
  return (
    <Layout>
      <h1 className="text-4xl font-bold text-gray-300">Eliminatorias</h1>
      <div className="mt-20 flex h-80 w-full items-center justify-between">
        <div className="flex h-full w-1/2 items-center justify-start">
          <div className="flex h-full w-1/4 flex-col items-start justify-evenly pl-16">
            {props.matches.slice(0, 4).map((match, i) => (
              <div className="mb-5" key={i}>
                <div
                  className="mb-2 flex cursor-pointer items-start justify-center pr-10 transition-all hover:bg-black hover:bg-opacity-10"
                  onClick={() => {
                    const newQuarters = [...quarters];
                    newQuarters[i] = match.country1!;
                    setQuarters(newQuarters);
                    const semisIndex = semis.findIndex(
                      (c) => c?.id === match.country2!.id
                    );
                    if (semisIndex !== undefined) {
                      const newSemis = [...semis];
                      newSemis[semisIndex] = undefined;
                      setSemis(newSemis);
                    }
                    if (final[0]?.id === match.country2!.id) {
                      setFinal([undefined, final[1]]);
                      setLastStageWinners([undefined, lastStageWinners[1]]);
                    }
                    if (thirdPlace[0]?.id === match.country2!.id) {
                      setThirdPlace([undefined, thirdPlace[1]]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <Image
                    src={`https://www.worldometers.info/img/flags/${
                      match.country1!.flagCode
                    }-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                  <div className="ml-2 text-gray-300">
                    {match.country1!.name}
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start justify-center pr-10 transition-all hover:bg-black hover:bg-opacity-10"
                  onClick={() => {
                    const newQuarters = [...quarters];
                    newQuarters[i] = match.country2!;
                    setQuarters(newQuarters);
                    const semisIndex = semis.findIndex(
                      (c) => c?.id === match.country1!.id
                    );
                    if (semisIndex !== undefined) {
                      const newSemis = [...semis];
                      newSemis[semisIndex] = undefined;
                      setSemis(newSemis);
                    }
                    if (final[0]?.id === match.country1!.id) {
                      setFinal([undefined, final[1]]);
                      setLastStageWinners([undefined, lastStageWinners[1]]);
                    }
                    if (thirdPlace[0]?.id === match.country1!.id) {
                      setThirdPlace([undefined, thirdPlace[1]]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <Image
                    src={`https://www.worldometers.info/img/flags/${
                      match.country2!.flagCode
                    }-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                  <div className="ml-2 text-gray-300">
                    {match.country2?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex h-full w-1/4 flex-col items-start justify-start py-12 pl-16">
            {quarters.slice(0, 4).map((country, i) => {
              if (!country) return <div />;
              return (
                <div
                  className={`flex cursor-pointer items-start justify-center pr-10 transition-all hover:bg-black hover:bg-opacity-10 ${
                    i === 1 ? "mb-24" : "mb-2"
                  }`}
                  key={country.id}
                  onClick={() => {
                    const newSemis = [...semis];
                    newSemis[Math.floor(i / 2)] = country!;
                    setSemis(newSemis);
                    if (
                      final[0]?.id ===
                      (i % 2 ? quarters[i - 1]?.id : quarters[i + 1]?.id)
                    ) {
                      setFinal([undefined, final[1]]);
                      setLastStageWinners([undefined, lastStageWinners[1]]);
                    }
                    if (
                      thirdPlace[0]?.id ===
                      (i % 2 ? quarters[i - 1]?.id : quarters[i + 1]?.id)
                    ) {
                      setThirdPlace([country, thirdPlace[1]]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <Image
                    src={`https://www.worldometers.info/img/flags/${country.flagCode}-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                  <div className="ml-2 text-gray-300">{country.name}</div>
                </div>
              );
            })}
          </div>
          <div className="flex h-full w-1/4 flex-col items-start justify-center py-12 pl-16">
            {semis.slice(0, 2).map((country, i) => {
              if (!country) return <div />;
              return (
                <div
                  className="mb-2 flex cursor-pointer items-start justify-center pr-10 transition-all hover:bg-black hover:bg-opacity-10"
                  key={country.id}
                  onClick={() => {
                    setFinal([country, final[1]]);
                    setLastStageWinners([undefined, lastStageWinners[1]]);
                    if (semis.slice(0, 2).every((c) => c !== undefined)) {
                      setThirdPlace([semis[Math.abs(i - 1)], thirdPlace[1]]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <Image
                    src={`https://www.worldometers.info/img/flags/${country.flagCode}-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                  <div className="ml-2 text-gray-300">{country.name}</div>
                </div>
              );
            })}
          </div>
          <div className="flex h-full w-1/4 flex-col items-start justify-between py-12 pl-16">
            <div />
            {final[0] && (
              <div
                className={`mb-2 flex cursor-pointer items-start justify-center pr-10 transition-all ${
                  lastStageWinners[0] === 0 ? "bg-black bg-opacity-10" : ""
                } hover:bg-black hover:bg-opacity-10`}
                key={final[0].id}
                onClick={() => setLastStageWinners([0, lastStageWinners[1]])}
              >
                <div className="mr-2 text-gray-300">{final[0].name}</div>
                <Image
                  src={`https://www.worldometers.info/img/flags/${final[0].flagCode}-flag.gif`}
                  height="20px"
                  width="20px"
                  className="rounded-full"
                />
              </div>
            )}
            {thirdPlace[0] ? (
              <div
                className={`mb-2 flex cursor-pointer items-start justify-center pr-10 transition-all ${
                  lastStageWinners[1] === 0 ? "bg-black bg-opacity-10" : ""
                } hover:bg-black hover:bg-opacity-10`}
                key={thirdPlace[0].id}
                onClick={() => setLastStageWinners([lastStageWinners[0], 0])}
              >
                <div className="mr-2 text-gray-300">{thirdPlace[0].name}</div>
                <Image
                  src={`https://www.worldometers.info/img/flags/${thirdPlace[0].flagCode}-flag.gif`}
                  height="20px"
                  width="20px"
                  className="rounded-full"
                />
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        <div className="flex h-full w-1/2 flex-row-reverse items-center justify-start">
          <div className="flex h-full w-1/4 flex-col items-start justify-evenly pr-16">
            {props.matches.slice(4, 8).map((match, i) => (
              <div className="mb-5" key={i}>
                <div
                  className="mb-2 flex cursor-pointer items-start justify-center pl-10 transition-all hover:bg-black hover:bg-opacity-10"
                  onClick={() => {
                    const newQuarters = [...quarters];
                    newQuarters[i + 4] = match.country1!;
                    setQuarters(newQuarters);
                    const semisIndex = semis.findIndex(
                      (c) => c?.id === match.country2!.id
                    );
                    if (semisIndex !== undefined) {
                      const newSemis = [...semis];
                      newSemis[semisIndex] = undefined;
                      setSemis(newSemis);
                    }
                    if (final[0]?.id === match.country2!.id) {
                      setFinal([final[0], undefined]);
                      setLastStageWinners([undefined, lastStageWinners[1]]);
                    }
                    if (thirdPlace[0]?.id === match.country2!.id) {
                      setThirdPlace([thirdPlace[0], undefined]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <div className="mr-2 text-gray-300">
                    {match.country1!.name}
                  </div>
                  <Image
                    src={`https://www.worldometers.info/img/flags/${
                      match.country1!.flagCode
                    }-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                </div>
                <div
                  className="flex cursor-pointer items-start justify-center pl-10 transition-all hover:bg-black hover:bg-opacity-10"
                  onClick={() => {
                    const newQuarters = [...quarters];
                    newQuarters[i + 4] = match.country2!;
                    setQuarters(newQuarters);
                    const semisIndex = semis.findIndex(
                      (c) => c?.id === match.country1!.id
                    );
                    if (semisIndex !== undefined) {
                      const newSemis = [...semis];
                      newSemis[semisIndex] = undefined;
                      setSemis(newSemis);
                    }
                    if (final[1]?.id === match.country1!.id) {
                      setFinal([final[0], undefined]);
                      setLastStageWinners([undefined, lastStageWinners[1]]);
                    }
                    if (thirdPlace[1]?.id === match.country1!.id) {
                      setThirdPlace([thirdPlace[0], undefined]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <div className="mr-2 text-gray-300">
                    {match.country2?.name}
                  </div>
                  <Image
                    src={`https://www.worldometers.info/img/flags/${
                      match.country2!.flagCode
                    }-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex h-full w-1/4 flex-col items-start justify-start py-12 pr-16">
            {quarters.slice(4, 8).map((country, i) => {
              if (!country) return <div />;
              return (
                <div
                  className={`flex cursor-pointer items-start justify-center pl-10 transition-all hover:bg-black hover:bg-opacity-10 ${
                    i === 1 ? "mb-24" : "mb-2"
                  }`}
                  key={country.id}
                  onClick={() => {
                    const newSemis = [...semis];
                    newSemis[Math.floor(i / 2) + 2] = country!;
                    console.log(newSemis);
                    setSemis(newSemis);
                    if (
                      final[1]?.id ===
                      (i % 2 ? quarters[i - 1]?.id : quarters[i + 1]?.id)
                    ) {
                      setFinal([final[0], undefined]);
                      setLastStageWinners([undefined, lastStageWinners[1]]);
                    }
                    if (
                      thirdPlace[1]?.id ===
                      (i % 2 ? quarters[i - 1]?.id : quarters[i + 1]?.id)
                    ) {
                      setThirdPlace([thirdPlace[0], country]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <div className="mr-2 text-gray-300">{country.name}</div>
                  <Image
                    src={`https://www.worldometers.info/img/flags/${country.flagCode}-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex h-full w-1/4 flex-col items-start justify-center py-12 pr-16">
            {semis.slice(2, 4).map((country, i) => {
              if (!country) return <div />;
              return (
                <div
                  className="mb-2 flex cursor-pointer items-start justify-center pl-10 transition-all hover:bg-black hover:bg-opacity-10"
                  key={country.id}
                  onClick={() => {
                    setFinal([final[0], country]);
                    setLastStageWinners([undefined, lastStageWinners[1]]);
                    if (semis.slice(2, 4).every((c) => c !== undefined)) {
                      setThirdPlace([
                        thirdPlace[0],
                        semis[Math.abs(i - 1) + 2],
                      ]);
                      setLastStageWinners([lastStageWinners[0], undefined]);
                    }
                  }}
                >
                  <div className="mr-2 text-gray-300">{country.name}</div>
                  <Image
                    src={`https://www.worldometers.info/img/flags/${country.flagCode}-flag.gif`}
                    height="20px"
                    width="20px"
                    className="rounded-full"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex h-full w-1/4 flex-col items-start justify-between py-12 pr-16">
            <div />
            {final[1] && (
              <div
                className={`mb-2 flex cursor-pointer items-start justify-center pr-10 transition-all ${
                  lastStageWinners[0] === 1 ? "bg-black bg-opacity-10" : ""
                } hover:bg-black hover:bg-opacity-10`}
                key={final[1].id}
                onClick={() => setLastStageWinners([1, lastStageWinners[1]])}
              >
                <Image
                  src={`https://www.worldometers.info/img/flags/${final[1].flagCode}-flag.gif`}
                  height="20px"
                  width="20px"
                  className="rounded-full"
                />
                <div className="ml-2 text-gray-300">{final[1].name}</div>
              </div>
            )}
            {thirdPlace[1] ? (
              <div
                className={`mb-2 flex cursor-pointer items-start justify-center pr-10 transition-all ${
                  lastStageWinners[1] === 1 ? "bg-black bg-opacity-10" : ""
                } hover:bg-black hover:bg-opacity-10`}
                key={thirdPlace[1].id}
                onClick={() => setLastStageWinners([lastStageWinners[0], 1])}
              >
                <Image
                  src={`https://www.worldometers.info/img/flags/${thirdPlace[1].flagCode}-flag.gif`}
                  height="20px"
                  width="20px"
                  className="rounded-full"
                />
                <div className="ml-2 text-gray-300">{thirdPlace[1].name}</div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
      {lastStageWinners.every((c) => typeof c === "number") &&
        final.every((c) => !!c) &&
        thirdPlace.every((c) => !!c) &&
        semis.every((c) => !!c) &&
        quarters.every((c) => !!c) && (
          <button
            className="mt-4 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-xl text-gray-300 transition-[color,box-shadow] duration-[400ms,700ms] hover:text-gray-300 hover:shadow-[inset_13rem_0_0_0] hover:shadow-blue-500"
            onClick={() =>
              mutate({
                finals: final as { id: string }[],
                quarters: quarters as { id: string }[],
                semis: semis as { id: string }[],
                thirdPlace: thirdPlace as { id: string }[],
                winners: lastStageWinners as [number, number],
              })
            }
            disabled={isLoading || data}
          >
            {isLoading || data ? "Cargando..." : "Confirmar Resultados"}
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

  if (votes.length < 48 || votes.length >= 64) {
    return {
      redirect: {
        destination: "/leaderboard",
        permanent: false,
      },
    };
  }

  const matches = await prisma.match.findMany({
    where: {
      group: null,
      country1: { isNot: null },
      country2: { isNot: null },
    },
    include: { country1: true, country2: true },
    orderBy: { id: "asc" },
  });

  return {
    props: {
      matches,
    },
  };
};

export default Knockout;
