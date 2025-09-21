import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const BURN_TREASURY = 'Eu94CJ1rjdLSXQHNfj6zRFqn4iuhUvTNpJhP9poXigsh';
const NETWORK = 'https://api.mainnet-beta.solana.com';
const LOG_API = 'http://localhost:3000/logBurn';

const burnBtn = document.getElementById('burnBtn') as HTMLButtonElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const statusText = document.getElementById('status') as HTMLParagraphElement;
const burnTableBody = document.querySelector('#burnHistory tbody') as HTMLTableSectionElement;

const connection = new Connection(NETWORK);
const treasuryWallet = new PublicKey(BURN_TREASURY);

async function fetchBurnHistory() {
    const res = await fetch(LOG_API);
    const history = await res.json();
    burnTableBody.innerHTML = '';
    history.reverse().forEach((burn: any) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${burn.user}</td>
            <td>${burn.amount}</td>
            <td>${burn.signature}</td>
            <td>${burn.date}</td>
        `;
        burnTableBody.appendChild(row);
    });
}

burnBtn.addEventListener('click', async () => {
    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) {
        statusText.textContent = 'Enter a valid SOL amount!';
        return;
    }

    if (!(window as any).solana) {
        statusText.textContent = 'Please install Phantom wallet!';
        return;
    }

    try {
        await (window as any).solana.connect();
        const fromPubkey = (window as any).solana.publicKey;
        const lamports = amount * 1e9;

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey,
                toPubkey: treasuryWallet,
                lamports,
            })
        );

        const { signature } = await (window as any).solana.signAndSendTransaction(tx);
        await connection.confirmTransaction(signature, 'processed');

        // Log to backend
        await fetch(LOG_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: fromPubkey.toBase58(),
                amount,
                signature,
                date: new Date().toISOString()
            })
        });

        statusText.textContent = `Successfully burned ${amount} SOL! 🔥`;
        amountInput.value = '';
        fetchBurnHistory();
    } catch (err) {
        console.error(err);
        statusText.textContent = 'Transaction failed!';
    }
});

// Load history on start
fetchBurnHistory();
