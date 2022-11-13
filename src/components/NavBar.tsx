import Cookies from "js-cookie";
import Link from "next/link";
import React from "react";
import { useState } from "react";

export const NavBar = () => {
  const [name, _setName] = useState<string>(Cookies.get("name") ?? "");

  return (
    <nav className="border-gray-200 bg-slate-700 px-2 py-2.5 sm:px-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link href="/leaderboard" passHref>
          <a className="flex items-center">
            <img
              src="https://elegircolegio.com/images/made/images/remote/https_calidad.elegircolegio.com/images/uploads/logos/stxavier-c14_298_298_imagespattern_ec_img_300.png_80_80_65_bor1_cccccc_s.png"
              className="mr-3 h-6 sm:h-9"
              alt="Sanxa Logo"
            />
            <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-300">
              Prode Sanxa 2022
            </span>
          </a>
        </Link>
        {name && (
          <div className="inline w-auto rounded bg-gray-800 p-2 md:block">
            <Link href={`/prode/${name}`} passHref>
              <a className="block rounded bg-transparent p-0 text-gray-300 transition-colors hover:text-gray-400">
                Mi Prode
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
