import { Country } from "@prisma/client";
import { Dispatch, FC, SetStateAction } from "react";
import Image from "next/image";

interface Props {
  countries: Country[];
  setPoints: Dispatch<SetStateAction<Record<string, number>>>;
  setTiebreakCountries: Dispatch<SetStateAction<Country[]>>;
}

export const Tiebreak: FC<Props> = ({ countries, setPoints, setTiebreakCountries }) => {


    const handleTiebreak = (country: Country) => {
        setPoints(prev => ({
            ...prev,
            [country.name]: prev[country.name]! + (countries.length - 1) / 10
          }))
          setTiebreakCountries([])
    }

  return (
    <div className="flex w-3/4 flex-col items-center md:px-40 py-10 sticky md:static top-0 z-10 bg-slate-700 bg-opacity-90">
      <div className="flex w-full items-center justify-around">
        {countries.map((country) => (
          <div key={country.id} className="mx-2">
            <Image
              src={`https://www.worldometers.info/img/flags/${country.flagCode}-flag.gif`}
              height="150px"
              width="150px"
              className="rounded-full cursor-pointer"
              onClick={() => handleTiebreak(country)}
            />
          </div>
        ))}
      </div>
      <h3 className="text-gray-300">Desempatar</h3>
    </div>
  );
};
