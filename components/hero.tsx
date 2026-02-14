import Image from "next/image";

export function Hero() {
  return (
    <div className="relative w-full aspect-[2/1] max-h-56 sm:max-h-72 md:max-h-80 lg:max-h-96">
      <Image
        src="/lpcows.jpg"
        alt="Cows grazing in Laureate Park"
        fill
        className="object-cover object-bottom md:object-[center_73%]"
        priority
        sizes="100vw"
      />
      <div className="absolute bottom-0 inset-x-0 p-4 pb-4 bg-black/30">
        <div className="mx-auto max-w-lg">
          <p className="text-lg font-bold text-white drop-shadow-md">
            Keep our community safe
          </p>
          <p className="text-sm text-white/80 mt-0.5 drop-shadow-sm">
            Report loose cattle quickly — no account needed.
          </p>
        </div>
      </div>
    </div>
  );
}
