// Bitcoin Basics: the hub's self-paced course. Edit the text freely. Each lesson has a quiz; "correct" is the index of the right answer, counting from 0.
window.COURSE = {
  id: 'bitcoin-basics-v1',
  title: 'Bitcoin Basics',
  lessons: [
    {
      title: 'What money is',
      body: `
<p>Money is the thing everyone in a place agrees to accept for work and goods. Shells, salt, cattle, gold and paper have all been money. The best money is hard to make more of, easy to carry, easy to divide, and accepted far away.</p>
<p>The Kenyan shilling and the US dollar are fiat money: a government decides how much exists. When more is printed, each note buys less. That is why prices rise over the years and savings in notes shrink.</p>
<p>In Kakuma many people already save in dollars because a dollar travels further than a shilling. The cost is the exchange: changing dollars to another currency can take a large cut, sometimes a third of the money. Good money would move across borders without losing a third on the way.</p>`,
      read: { label: 'My First Bitcoin, lesson on the history of money', url: 'https://myfirstbitcoin.io' },
      quiz: [
        { q: 'What makes a good money?', a: ['It is printed by a strong government', 'It is hard to make more of, easy to carry, divide and send far', 'It is made of paper'], correct: 1 },
        { q: 'When a government prints a lot more of its currency, what happens to prices over time?', a: ['They fall', 'They stay the same', 'They rise, so each note buys less'], correct: 2 },
        { q: 'Why do many people in Kakuma save in dollars instead of shillings?', a: ['Dollars are accepted in more places', 'Dollars are made of gold', 'Shillings cannot be saved'], correct: 0 }
      ]
    },
    {
      title: 'What bitcoin is',
      body: `
<p>Bitcoin is money that runs on a network of computers around the world instead of on a bank or a government. It was described in a nine-page paper published on 31 October 2008 by someone using the name Satoshi Nakamoto, and the network started in January 2009.</p>
<p>There will only ever be 21 million bitcoin. Nobody can print more. Each bitcoin divides into 100 million sats, so you can hold or send a tiny amount. Most people in Kakuma will use sats, the way you use shillings rather than millions.</p>
<p>Every payment is recorded on a public ledger called the blockchain, kept by thousands of computers that check each other. No company owns it. Anyone with a phone and internet can use it, and no one needs permission.</p>
<p>Bitcoin is one thing. The thousands of other coins (Dogecoin, Litecoin and the rest) are copies with a founder, a company or a small group behind them who can change the rules, and most lose their value over time. At the hub we teach bitcoin only.</p>`,
      read: { label: 'The bitcoin whitepaper (nine pages)', url: 'https://bitcoin.org/bitcoin.pdf' },
      quiz: [
        { q: 'How many bitcoin will there ever be?', a: ['21 million', '100 million', 'As many as the network decides each year'], correct: 0 },
        { q: 'What is a sat?', a: ['A bitcoin bank account', 'One hundred-millionth of a bitcoin', 'A type of wallet'], correct: 1 },
        { q: 'Who controls the bitcoin network?', a: ['A company in America', 'The United Nations', 'No one; thousands of computers check each other'], correct: 2 }
      ]
    },
    {
      title: 'Keys and wallets',
      body: `
<p>Your bitcoin is controlled by a secret called a private key. A wallet is an app that holds your keys and makes payments. If you hold the keys, the bitcoin is yours and nobody can freeze it, take it, or stop you spending it. If a company holds the keys for you, you are trusting that company, the way you trust a bank.</p>
<p>When you create a wallet that holds your own keys, it gives you 12 or 24 words. These words are your keys. Write them on paper, keep the paper somewhere safe, and never type them into a website or send them to anyone. Anyone who has the words has your bitcoin. If your phone is lost, those words bring everything back on a new phone.</p>
<p>Some phone wallets give you no words. That means the company behind the wallet holds the keys, and your bitcoin, for you. They are easy to start with and fine for small amounts you spend. Savings belong in a wallet where you hold the words.</p>
<p>Start with a small amount. Practise sending to a friend at the hub. Confidence comes from doing it.</p>`,
      read: { label: 'bitcoin.org: choose a wallet', url: 'https://bitcoin.org/en/choose-your-wallet' },
      quiz: [
        { q: 'What are the 12 or 24 words a wallet gives you?', a: ['A password you can reset', 'Your keys; anyone with the words has your bitcoin', 'A receipt'], correct: 1 },
        { q: 'Someone on WhatsApp says they are wallet support and asks for your 12 words. What do you do?', a: ['Send them, support needs them', 'Send only the first six', 'Never send them; no real support ever asks'], correct: 2 },
        { q: 'If a company holds the keys for you, what is true?', a: ['You are trusting that company, like a bank', 'The bitcoin cannot be lost', 'You can never spend it'], correct: 0 }
      ]
    },
    {
      title: 'Receiving and sending',
      body: `
<p>To receive bitcoin you share an address or an invoice from your wallet. An address is a long string of letters and numbers; the person paying scans it as a QR code or pastes it. You can make a new one for every payment.</p>
<p>There are two ways to pay. On-chain payments go straight onto the blockchain, cost a fee that changes with how busy the network is, and take from ten minutes to a few hours to confirm. Lightning payments run on a network built on top of bitcoin, settle in seconds, and cost a few sats. For daily life and freelance work, Lightning is what you will use.</p>
<p>A lightning address looks like an email address, for example name@wallet.com. Give it to a client anywhere in the world and they can pay you in seconds. This is the address people show on the hub's directory. Most lightning addresses come from a wallet company that holds the sats for you until you move them, so treat that wallet as your pocket, and move what you want to keep into a wallet where you hold the words.</p>
<p>Always check the amount and the address before you confirm. A bitcoin payment cannot be reversed.</p>`,
      read: { label: 'Bitcoiner Guide: Lightning', url: 'https://bitcoiner.guide' },
      quiz: [
        { q: 'Which is better for being paid for a day of freelance work?', a: ['Lightning: seconds, a few sats in fees', 'On-chain: an hour or more, a changing fee', 'Neither; use a bank'], correct: 0 },
        { q: 'What does a lightning address look like?', a: ['A phone number', 'Something like name@wallet.com', 'A 12-word phrase'], correct: 1 },
        { q: 'Can a bitcoin payment be reversed after it is sent?', a: ['Yes, within 24 hours', 'Yes, by calling support', 'No, so check before you confirm'], correct: 2 }
      ]
    },
    {
      title: 'Staying safe',
      body: `
<p>Most bitcoin losses are not hacks. They are people giving their words away, or sending money to a stranger who promised to double it. The rules are short.</p>
<p>Nobody doubles your bitcoin. Any giveaway, any "send 10,000 sats and get 20,000 back", any celebrity promotion, is theft. No real person or company will ever ask for your 12 words. Investment groups promising monthly returns in bitcoin or any coin are the same trick with a longer story.</p>
<p>Keep your words on paper, not on your phone. Lock your phone. Keep a small amount in the wallet you use daily, and the rest somewhere you touch rarely. Tell a trusted person where the paper is, in case something happens to you.</p>
<p>If something feels urgent and secret, it is a scam. Real bitcoin is slow and boring.</p>`,
      read: { label: 'bitcoin.org: securing your wallet', url: 'https://bitcoin.org/en/secure-your-wallet' },
      quiz: [
        { q: 'A group promises 20% a month if you send them bitcoin. What is it?', a: ['A good investment', 'A scam; nobody can promise returns', 'A bank'], correct: 1 },
        { q: 'Where should your 12 words live?', a: ['In a WhatsApp message to yourself', 'On paper in a safe place', 'In the notes app on your phone'], correct: 1 },
        { q: 'What is the sign of almost every scam?', a: ['It is urgent and secret', 'It uses a QR code', 'It is in English'], correct: 0 }
      ]
    },
    {
      title: 'Getting paid in bitcoin',
      body: `
<p>If you do freelance work, you can ask to be paid in bitcoin today. Some organisations that hire remote workers already offer it. Others will do it if you make it easy for them.</p>
<p>Set up a Lightning wallet and get your lightning address. Put it on your invoice next to your bank details: "Pay in bitcoin: name@wallet.com". When the payment lands, it is yours in seconds, with nothing taken out on the way and nothing lost at the exchange counter.</p>
<p>Decide your rule for spending. Many people keep the bitcoin and change only what they need into shillings each week, so their savings sit in money that cannot be printed. Others sell straight away. Both are fine. The point is that you choose. Bitcoin's price in shillings moves a lot from week to week, so money you need next month is safer changed sooner.</p>
<p>Add yourself to the hub's member directory so clients can find you, see your work and pay you in bitcoin. Then come to a Saturday class and show someone else how.</p>`,
      read: { label: 'Plan B Network: courses for freelancers', url: 'https://planb.network' },
      quiz: [
        { q: 'What do you put on an invoice so a client can pay you in bitcoin?', a: ['Your 12 words', 'Your lightning address', 'Your phone IMEI'], correct: 1 },
        { q: 'What happens to a Lightning payment from a client abroad?', a: ['It arrives in seconds with no exchange cut', 'It takes five working days', 'It must go through a bank first'], correct: 0 },
        { q: 'Who decides whether you keep the bitcoin or change it to shillings?', a: ['The client', 'The hub', 'You'], correct: 2 }
      ]
    }
  ]
};
