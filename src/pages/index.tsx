import type { NextPage, GetServerSideProps } from "next";
import { FormEventHandler, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import Cookies from "js-cookie";
import { verifyUserToken } from "../utils/jwt";
import { useRouter } from "next/router";
import { Layout } from "../components/Layout";

const Home: NextPage = () => {
  const { mutate, data, isLoading, isError } = trpc.auth.login.useMutation({});

  const [form, setForm] = useState({ name: "", password: "", });
  const router = useRouter();

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    console.log(form);
    if (Object.values(form).some((v) => !v)) return;
    mutate(form);
  };

  useEffect(() => {
    if (data?.token) {
      const expiringDate = new Date();
      expiringDate.setFullYear(2023);
      console.log(expiringDate);
      Cookies.set("token", data.token, { expires: expiringDate });
      Cookies.set("name", data.user.name, { expires: expiringDate})
      router.push("/prode");
    }
  }, [data?.token]);

  useEffect(() => {
    setForm({
      name: (document.getElementById("name")! as HTMLInputElement).value || "",
      password:
        (document.getElementById("password")! as HTMLInputElement).value || "",
    });
  }, []);

  return (
    <Layout>
      <h1 className="text-center text-5xl font-extrabold leading-normal text-gray-200 md:text-[5rem]">
        Prode <span className="text-purple-300">Sanxa</span> Mundial 2022
      </h1>
      <form
        className="mt-3 pt-3 text-center lg:w-2/3 lg:px-40"
        autoComplete="off"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="mb-6">
          <label
            htmlFor="name"
            className="mb-2 block text-left text-sm font-medium text-gray-300"
          >
            Nombre
          </label>
          <input
            type="text"
            id="name"
            className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Joaquin Eduard Girod"
            autoComplete="off"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className={`mb-2 block text-left text-sm font-medium ${
              isError ? "text-red-500" : "text-gray-300"
            }`}
          >
            Contraseña {isError && "incorrecta"}
          </label>
          <input
            type="password"
            id="password"
            className={`block w-full rounded-lg border ${
              isError ? "border-red-500" : "border-gray-600"
            }  bg-gray-700 p-2.5 text-sm ${
              isError ? "text-red-500" : "text-gray-300"
            } placeholder-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
            placeholder="•••••••••"
            autoComplete="off"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <button
          className="text-md rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-gray-300 transition-[color,box-shadow] duration-[400ms,700ms] hover:text-gray-300 hover:shadow-[inset_13rem_0_0_0] hover:shadow-blue-500"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
    </Layout>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { token = "" } = req.cookies;

  const user = await verifyUserToken(token);
  console.log({user})

  if (user) {
    return {
      redirect: {
        destination: "/prode",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
