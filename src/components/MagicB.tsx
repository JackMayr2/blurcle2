import Image from 'next/image';

export default function MagicB() {
    return (
        <div className="relative w-80 h-80 mx-auto overflow-hidden rounded-full">
            {/* Static Magic B Ball */}
            <Image
                src="/images/magic-b.svg"
                alt="Magic B"
                width={320}
                height={320}
                className="w-full h-full"
                priority
            />
        </div>
    );
} 