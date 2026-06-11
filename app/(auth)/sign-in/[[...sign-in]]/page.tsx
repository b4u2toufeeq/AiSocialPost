import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 dark">
      <div className="relative w-full max-w-md">
        {/* Sleek backing blur glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl"></div>
        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
          <SignIn
            appearance={{
              elements: {
                card: "bg-transparent shadow-none border-none p-0 w-full text-slate-100",
                headerTitle: "text-slate-100 font-bold text-xl",
                headerSubtitle: "text-slate-400 text-sm",
                socialButtonsBlockButton: "border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-200 transition-all duration-200",
                socialButtonsBlockButtonText: "text-slate-200 font-medium",
                formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-md transition-all duration-250",
                formFieldLabel: "text-slate-350 text-xs font-semibold",
                formFieldInput: "bg-slate-950/50 border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all",
                footerActionText: "text-slate-450",
                footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold transition-all",
                dividerLine: "bg-slate-850",
                dividerText: "text-slate-450",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
