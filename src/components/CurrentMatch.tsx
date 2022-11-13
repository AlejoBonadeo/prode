import { PossibleResult, Vote } from "@prisma/client";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { MatchWithCountry } from "../pages/prode";

type Props = {
  match: MatchWithCountry;
  votes: Record<string, Omit<Vote, "userId" | "id">>;
  setVotes: Dispatch<
    SetStateAction<Record<string, Omit<Vote, "userId" | "id">>>
  >;
  setPoints: Dispatch<SetStateAction<Record<string, number>>>;
  readonly?: boolean;
  result?: PossibleResult;
}

export const pointsToSum: Record<PossibleResult, [number, number]> = {
  WIN_C_1: [3, 0],
  DRAW: [1, 1],
  WIN_C_2: [0, 3],
};

export const CurrentMatch: FC<Props> = ({
  match,
  votes,
  setVotes,
  setPoints,
  readonly = false,
  result
}) => {
  const [prediction, setPrediction] = useState<PossibleResult | null>();

  useEffect(() => {
    setPrediction(votes[match.id]?.result || null);
  }, [match]);

  const castPrediction = (result: PossibleResult) => {
    if (!!votes[match.id]) {
      setPoints((prev) => ({
        ...prev,
        [match.country1!.name]:
          prev[match.country1!.name]! - pointsToSum[votes[match.id]!.result][0],
        [match.country2!.name]:
          prev[match.country2!.name]! - pointsToSum[votes[match.id]!.result][1],
      }));
    }
    setVotes((prev) => ({
      ...prev,
      [match.id]: {
        country1Id: match.country1Id!,
        country2Id: match.country2Id!,
        result,
        matchId: match.id,
      },
    }));
    setPoints((prev) => ({
      ...prev,
      [match.country1!.name]:
        prev[match.country1!.name]! + pointsToSum[result][0],
      [match.country2!.name]:
        prev[match.country2!.name]! + pointsToSum[result][1],
    }));
    setPrediction(result);
  };

  return (
    <div className="w-full md:w-3/4 md:px-40 py-10 sticky md:static top-0 z-10 bg-slate-700 bg-opacity-90">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 text-md md:text-5xl font-bold text-gray-300">
            {match.country1!.name}
          </div>
          <Image
            src={`https://www.worldometers.info/img/flags/${
              match.country1!.flagCode
            }-flag.gif`}
            height="150px"
            width="150px"
            className="rounded-full"
          />
        </div>
        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 md:h-20  md:w-20 text-[8px] md:text-lg cursor-pointer items-center justify-center rounded-full border border-gray-300 text-gray-300 ${
              (result || prediction) === "WIN_C_1"
                ? "shadow-[inset_13rem_0_0_0] shadow-blue-500"
                : "hover:bg-black hover:bg-opacity-10"
            } mx-5 text-center`}
            onClick={() => readonly || castPrediction("WIN_C_1")}
          >
            {match.country1!.name}
            <br /> WIN
          </div>
          <div
            className={`flex h-8 w-8 md:h-20  md:w-20 text-[8px] md:text-lg  cursor-pointer items-center justify-center rounded-full border border-gray-300 text-gray-300 ${
              (result || prediction) === "DRAW"
                ? "shadow-[inset_13rem_0_0_0] shadow-blue-500"
                : "hover:bg-black hover:bg-opacity-10"
            } mx-5 text-center`}
            onClick={() => readonly || castPrediction("DRAW")}
          >
            DRAW
          </div>
          <div
            className={`flex h-8 w-8 md:h-20  md:w-20 text-[8px] md:text-lg  cursor-pointer items-center justify-center rounded-full border border-gray-300 text-gray-300 ${
              (result || prediction) === "WIN_C_2"
                ? "shadow-[inset_13rem_0_0_0] shadow-blue-500"
                : "hover:bg-black hover:bg-opacity-10"
            } mx-5 text-center`}
            onClick={() => readonly || castPrediction("WIN_C_2")}
          >
            {match.country2!.name}
            <br /> WIN
          </div>
        </div>
        <div className="flex items-center">
          <Image
            src={`https://www.worldometers.info/img/flags/${
              match.country2!.flagCode
            }-flag.gif`}
            height="150px"
            width="150px"
            className="rounded-full"
          />
          <div className="ml-2 text-md md:text-5xl font-bold text-gray-300">
            {match.country2!.name}
          </div>
        </div>
      </div>
    </div>
  );
};
