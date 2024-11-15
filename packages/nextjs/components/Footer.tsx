import Link from "next/link";

export const Footer = () => {
  return (
    <footer id="footer">
      <hr className="container w-11/12" />

      <section className="container grid grid-cols-2 py-20 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full xl:col-span-2">
          <Link href="/" rel="noreferrer noopener" className="flex text-xl font-bold hover:underline">
            <h1 className="items-center justify-center pl-2 mr-3 text-xl font-bold md:flex">
              🍜
              <span className="hidden ml-2 md:flex">noodles.fun</span>
            </h1>
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Links</h3>
          <div>
            <a rel="noreferrer noopener" href="#" className="opacity-60 hover:opacity-100">
              Home
            </a>
          </div>

          <div>
            <a rel="noreferrer noopener" href="#" className="opacity-60 hover:opacity-100">
              Explore
            </a>
          </div>

          {/* <div>
            <a rel="noreferrer noopener" href="#" className="opacity-60 hover:opacity-100">
              Leaderboard
            </a>
          </div> */}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">About</h3>
          <div>
            <a rel="noreferrer noopener" href="#" className="opacity-60 hover:opacity-100">
              How it works
            </a>
          </div>

          <div>
            <a rel="noreferrer noopener" href="#" className="opacity-60 hover:opacity-100">
              FAQ
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Community</h3>
          <div>
            <a rel="noreferrer noopener" href="#" className="opacity-60 hover:opacity-100">
              X
            </a>
          </div>

          <div>
            <a rel="noreferrer noopener" href="#" className="opacity-60 hover:opacity-100">
              Discord
            </a>
          </div>
        </div>
      </section>

      <section className="container text-center pb-14">
        <h3>
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="#"
            className="transition-all text-primary border-primary hover:border-b-2"
          >
            Made with ❤️ in Bangkok
          </a>
        </h3>
      </section>
    </footer>
  );
};
