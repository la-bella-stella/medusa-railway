"use client"

import { useState } from "react"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import { useTranslation } from "react-i18next"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)
  const { t } = useTranslation("account")

  return (
    <main className="flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {currentView === LOGIN_VIEW.SIGN_IN
            ? t("login.title", "Sign In")
            : t("register.title", "Create Account")}
        </h1>

        {currentView === LOGIN_VIEW.SIGN_IN ? (
          <Login setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}
      </div>
    </main>
  )
}

export default LoginTemplate
