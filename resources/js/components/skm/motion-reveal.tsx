import { cn } from '@/lib/utils';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface MotionRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    variant?: 'up' | 'scale' | 'fade';
}

export function MotionReveal({ children, className, delay = 0, variant = 'up' }: MotionRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) {
            setVisible(true);
            return;
        }

        const prefersReduced =
            typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced || typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }

        const checkVisibleNow = () => {
            const rect = node.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.96) {
                setVisible(true);
                return true;
            }
            return false;
        };

        if (checkVisibleNow()) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
                        setVisible(true);
                        observer.disconnect();
                        break;
                    }
                }
            },
            { threshold: 0, rootMargin: '0px 0px -16px 0px' },
        );

        observer.observe(node);

        const handleHashChange = () => {
            window.requestAnimationFrame(() => {
                if (checkVisibleNow()) {
                    observer.disconnect();
                }
            });
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            observer.disconnect();
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const hiddenState =
        variant === 'scale' ? 'translate-y-5 scale-[0.98] opacity-0' : variant === 'fade' ? 'opacity-0' : 'translate-y-6 opacity-0';

    return (
        <div
            ref={ref}
            style={{ transitionDelay: visible && delay > 0 ? `${delay}ms` : '0ms' }}
            className={cn(
                'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none',
                visible ? 'translate-y-0 scale-100 opacity-100' : hiddenState,
                className,
            )}
        >
            {children}
        </div>
    );
}
