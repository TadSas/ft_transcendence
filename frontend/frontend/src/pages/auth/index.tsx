import { Link } from 'react-router-dom'


const AuthPage = () => {
  return (
    <>
      <div className="h-screen bg-struck-axiom">
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-20 w-auto"
              src={require('../../assets/svg/42Yerevan.svg').default}
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Welcome to <span className="inline font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">ft Transcendence</span></h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" action="#" method="POST">
                <div>
                  {
                  /* <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <Link to="/home">Sign in with 42</Link>
                  </button> */
                  }
                  <Link to="/home">
                    <div
                      className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Sign in with 42
                    </div>
                  </Link>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Check out student creators</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div>
                    <a
                      target="_blank"
                      href="https://profile.intra.42.fr/users/stadevos"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      stadevos
                      <span className="sr-only">stadevos</span>
                      <img
                        className="mx-auto pl-2 h-5 w-auto"
                        src={require('../../assets/svg/42School.svg').default}
                        alt="Your Company"
                      />
                    </a>
                  </div>

                  <div>
                    <a
                      target="_blank"
                      href="https://profile.intra.42.fr/users/syeghiaz"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      syeghiaz
                      <span className="sr-only">syeghiaz</span>
                      <img
                        className="mx-auto pl-2 h-5 w-auto"
                        src={require('../../assets/svg/42School.svg').default}
                        alt="Your Company"
                      />
                    </a>
                  </div>

                  <div>
                    <a
                      target="_blank"
                      href="https://profile.intra.42.fr/users/dmartiro"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      dmartiro
                      <span className="sr-only">dmartiro</span>
                      <img
                        className="mx-auto pl-2 h-5 w-auto"
                        src={require('../../assets/svg/42School.svg').default}
                        alt="Your Company"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthPage
