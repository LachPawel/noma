"use client";

export default function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover grayscale"
          controlsList="nodownload"
          loop
          muted
          playsInline
        >
          <source src="https://bliskioptyk.pl/a21aa.mp4" type="video/mp4" />
        </video>
      </div>

      <div
        className="absolute inset-0 opacity-60 mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grunge1'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grunge1)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grunge2'%3E%3CfeTurbulence type='turbulence' baseFrequency='2.0' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grunge2)'/%3E%3C/svg%3E\")",
          backgroundSize: "150px 150px",
        }}
      />

      <div className="absolute inset-0 opacity-30 vhs-static" />

      <div
        className="absolute inset-0 opacity-15 dust-particles"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='dust'%3E%3CfeTurbulence type='turbulence' baseFrequency='8' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23dust)' opacity='0.6'/%3E%3C/svg%3E\")",
          backgroundSize: "80px 80px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-30 scanlines-crt"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
