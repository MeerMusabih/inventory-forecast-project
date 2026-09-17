import clsx from 'clsx'

interface LoadingScreenProps {
  fullscreen?: boolean
}

export default function LoadingScreen({ fullscreen = true }: LoadingScreenProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        fullscreen ? 'fixed inset-0 z-[100] bg-white/50' : 'h-full w-full min-h-[280px]'
      )}
    >
      <div className="animate-[logoPulse_1.8s_ease-in-out_infinite]">
        <img
          src="/bakery-logo.png"
          alt=""
          width={128}
          height={128}
          className="h-32 w-32 object-contain"
          draggable={false}
        />
      </div>
    </div>
  )
}