import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign in | Lake Region Property Resource",
};

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-4 py-10">
      <SignIn />
    </main>
  );
}
