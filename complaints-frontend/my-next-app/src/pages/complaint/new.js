import React from 'react';
import Link from 'next/link';

const NewComplaint = () => {
    return (
        <div>
            <h1>Vytvoriť novú reklamáciu</h1>
            <Link href="/complaint/new/CreateInternalComplaint">
                <a>Vytvoriť internú reklamáciu</a>
            </Link>
            <Link href="/complaint/new/CreateExternalComplaint">
                <a>Vytvoriť externú reklamáciu</a>
            </Link>
        </div>
    );
}

export default NewComplaint;