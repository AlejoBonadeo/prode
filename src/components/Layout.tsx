import Head from 'next/head'
import { FC, ReactNode } from 'react'

export const Layout: FC<{children: ReactNode}> = ({children}) => {
  return (
    <>
        <Head>
            <title>Prode Sanxa Mundial 2022</title>
            <meta
            name="description"
            content="1.	m. Ar. Juego de azar oficial que consiste en pronosticar los resultados de un cierto número de partidos de fútbol"
            />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="m-0 flex min-h-screen w-full flex-col items-center justify-center bg-slate-700 p-4">
            {children}
        </main>
    </>
  )
}
