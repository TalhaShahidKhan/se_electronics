'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function ProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.configure({
            showSpinner: false,
            trickleSpeed: 200,
            minimum: 0.08
        });
    }, []);

    useEffect(() => {
        // Complete the progress bar when navigation finishes
        NProgress.done();
    }, [pathname, searchParams]);

    useEffect(() => {
        // Add click event listeners to all links
        const handleLinkClick = (event: MouseEvent) => {
            const target = event.currentTarget as HTMLAnchorElement;
            const href = target.getAttribute('href');

            if (href && !href.startsWith('#') && !href.startsWith('http') && href !== pathname) {
                // Start the progress bar immediately when link is clicked
                NProgress.start();
            }
        };

        // Find all internal links and add listeners
        const links = document.querySelectorAll('a[href^="/"]:not([data-disable-progressbar-trigger])');
        links.forEach((link) => {
            link.addEventListener('click', handleLinkClick as EventListener);
        });

        // Cleanup
        return () => {
            links.forEach((link) => {
                link.removeEventListener('click', handleLinkClick as EventListener);
            });
        };
    }, [pathname]); // Re-run when pathname changes to catch new links

    return null;
}