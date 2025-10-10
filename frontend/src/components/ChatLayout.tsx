const contacts = [
  {
    name: 'Sophia Clark',
    time: '10:30 AM',
    status: 'Typing...',
    online: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzGEgnM9y8m5hDYSXSdCGwv7Kcd_PFCxld8SW3HU9qkPrI5D_9YkbHMrmQD94TKPenXSYa4yIh1jUUxzDbLf_OTMpJq4KExpngs18H3qw922S-YstvImEz7Ya2RERKsSS-__pd5L1pikDMDCa6ghBRwLjPUDB0hSQasIAd9sHUgN1JJlB-vRtEzAVdlrBH3iAJD00ruxT6dHgBN3CgUilZ2TUALzqPMF6BUqwC_V1cT05KTdjTQDKaC7ROj3wrFcuqAMjtubMWR7s',
    active: true,
  },
  {
    name: 'Ethan Bennett',
    time: '9:45 AM',
    status: 'Sounds good!',
    online: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhshRGqBLO4bSTplPKqAQ3dmbWzZHPUK77Urzfs0jyBiGzkHgoe0hAHQxXdoMjM-9m-czWKTsBFYnnNtKUAq32dfaW-lPg0G3H_xeRlO2kxgmmI7sU4DauxPYPW_qFsV9-5UM2iugQ2zJwPRUUywmOTmNFwJFZljluZOsyaLjEbMubgduck8KK0Gknf09UaSNsBgB3I78Q0547t3-_k8Kl8xaa_TlQwxcicfZ344i-XEplIA_jhWAj0zsgSvBKNWFezDJmnzyjpGM',
  },
  {
    name: 'Olivia Harper',
    time: 'Yesterday',
    status: 'See you then.',
    online: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqorrYXVykLYe2ONsaFJmtI-7sc6D5qzfeKVNdd-jm4l3Ezfvx2BZva2WdQmCRI2MsjFjt8Wt5lc0xfQyBwjM4O8T14IHvk--AT65qDjTjL3cwyh_DcWvFNzpMh7WAyijPn5qAvwdFkGvfFLWQeh-xzkyhzAFpRJbBd84oOId4ESCLhmjezIvEX0s5Ht8Wf3HEVKP271D61EpJvF8cnNnZW-ubhSvgU0Ad5YVZxsfVd3xTDL_w7ay-F80nS0mSx48o05wx5j1Ss78',
  },
  // add others if needed...
];

const ChatLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      {/* Sidebar */}
      <aside className="flex h-full w-80 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
              search
            </span>
            <input
              type="text"
              placeholder="Search contacts or messages"
              className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 text-text-muted-light hover:bg-primary/10 hover:text-primary dark:text-text-muted-dark dark:hover:bg-primary/20">
              <span className="material-symbols-outlined">chat_add_on</span>
            </button>
            <button className="rounded-full p-2 text-text-muted-light hover:bg-primary/10 hover:text-primary dark:text-text-muted-dark dark:hover:bg-primary/20">
              <span className="material-symbols-outlined">group_add</span>
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col">
            {contacts.map((c, i) => (
              <a
                key={i}
                href="#"
                className={`flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-primary/10 dark:hover:bg-primary/20 ${
                  c.active
                    ? 'bg-primary/10 dark:bg-primary/20 border-r-2 border-primary'
                    : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-surface-light dark:border-surface-dark ${
                      c.online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-baseline justify-between">
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                      {c.time}
                    </p>
                  </div>
                  <p className="truncate text-sm text-text-muted-light dark:text-text-muted-dark">
                    {c.status}
                  </p>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNfft8Ta0MVXgy8aLALSicXft10LDs0s19IXwtAvfBW8S_OR2_fMIEATBqX24IfKeFFcd8TDLGHgpbvmx5V2wH_e7f3CpXRhqJAw1WqNY4h9j1XeZGMdSb4pgSCOSV8pc5IfBgF86phgEvafb-M5spIdJzILVg1pqUbteytzUplAaH2ZjVHVbVauwlRdTu4MG8cfR1gN0mIG9YLLQdCJ80409nLmvBRyf8UFhIT282MtAZxTZa0Cu44Ddi-oQ_6UsBSHfmleSwZsI"
              alt="Select a chat"
              className="w-full max-w-xs"
            />
          </div>
          <h1 className="text-2xl font-bold">
            Select a chat to start messaging
          </h1>
          <p className="mt-2 max-w-md text-text-muted-light dark:text-text-muted-dark">
            Your messages are end-to-end encrypted and private. Stay connected
            with your friends and family securely.
          </p>
          <button className="mt-6 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition-transform hover:scale-105">
            Start a New Chat
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatLayout;
