import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign up | Lake Region Property Resource",
};

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-4 py-10">
      <SignUp />
    </main>
  );
}
