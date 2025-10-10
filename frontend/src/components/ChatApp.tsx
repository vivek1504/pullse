import '../index.css';

// ✅ Optional helper Icon component for cleaner markup
const Icon = ({ name, className = '' }: { name: any; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const ChatApp = () => {
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      {/* Sidebar */}
      <aside className="flex h-full w-80 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark"
            />
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
              <Icon name="chat_add_on" />
            </button>
            <button className="rounded-full p-2 text-text-muted-light hover:bg-primary/10 hover:text-primary dark:text-text-muted-dark dark:hover:bg-primary/20">
              <Icon name="group_add" />
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col">
            {/* Chat item */}
            {[
              {
                name: 'Sophia Clark',
                message: 'Typing...',
                time: '10:30 AM',
                online: true,
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzGEgnM9y8m5hDYSXSdCGwv7Kcd_PFCxld8SW3HU9qkPrI5D_9YkbHMrmQD94TKPenXSYa4yIh1jUUxzDbLf_OTMpJq4KExpngs18H3qw922S-YstvImEz7Ya2RERKsSS-__pd5L1pikDMDCa6ghBRwLjPUDB0hSQasIAd9sHUgN1JJlB-vRtEzAVdlrBH3iAJD00ruxT6dHgBN3CgUilZ2TUALzqPMF6BUqwC_V1cT05KTdjTQDKaC7ROj3wrFcuqAMjtubMWR7s',
              },
              {
                name: 'Ethan Bennett',
                message: 'Sounds good!',
                time: '9:45 AM',
                online: true,
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhshRGqBLO4bSTplPKqAQ3dmbWzZHPUK77Urzfs0jyBiGzkHgoe0hAHQxXdoMjM-9m-czWKTsBFYnnNtKUAq32dfaW-lPg0G3H_xeRlO2kxgmmI7sU4DauxPYPW_qFsV9-5UM2iugQ2zJwPRUUywmOTmNFwJFZljluZOsyaLjEbMubgduck8KK0Gknf09UaSNsBgB3I78Q0547t3-_k8Kl8xaa_TlQwxcicfZ344i-XEplIA_jhWAj0zsgSvBKNWFezDJmnzyjpGM',
              },
            ].map((chat, i) => (
              <a
                key={i}
                href="#"
                className={`flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-primary/10 dark:hover:bg-primary/20 ${
                  i === 0
                    ? 'bg-primary/10 dark:bg-primary/20 border-r-2 border-primary'
                    : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={chat.img}
                    alt={chat.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-surface-light dark:border-surface-dark ${
                      chat.online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-baseline justify-between">
                    <p className="truncate font-semibold">{chat.name}</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                      {chat.time}
                    </p>
                  </div>
                  <p className="truncate text-sm text-text-muted-light dark:text-text-muted-dark">
                    {chat.message}
                  </p>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Chat Main Area */}
      <main className="flex h-screen flex-1 flex-col bg-background-light dark:bg-background-dark">
        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 py-3">
          <div className="flex items-center gap-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzGEgnM9y8m5hDYSXSdCGwv7Kcd_PFCxld8SW3HU9qkPrI5D_9YkbHMrmQD94TKPenXSYa4yIh1jUUxzDbLf_OTMpJq4KExpngs18H3qw922S-YstvImEz7Ya2RERKsSS-__pd5L1pikDMDCa6ghBRwLjPUDB0hSQasIAd9sHUgN1JJlB-vRtEzAVdlrBH3iAJD00ruxT6dHgBN3CgUilZ2TUALzqPMF6BUqwC_V1cT05KTdjTQDKaC7ROj3wrFcuqAMjtubMWR7s"
              alt="Sophia Clark"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">Sophia Clark</h2>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['call', 'videocam', 'more_vert'].map((icon) => (
              <button
                key={icon}
                className="rounded-full p-2 text-text-muted-light hover:bg-primary/10 hover:text-primary dark:text-text-muted-dark dark:hover:bg-primary/20"
              >
                <Icon name={icon} />
              </button>
            ))}
          </div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Encryption Message */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-surface-light dark:bg-surface-dark px-3 py-1 text-xs text-text-muted-light dark:text-text-muted-dark shadow-sm">
                <Icon name="lock" className="text-base" />
                <span>Messages are end-to-end encrypted.</span>
              </div>
            </div>

            {/* Incoming Message */}
            <div className="flex items-end gap-2">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzGEgnM9y8m5hDYSXSdCGwv7Kcd_PFCxld8SW3HU9qkPrI5D_9YkbHMrmQD94TKPenXSYa4yIh1jUUxzDbLf_OTMpJq4KExpngs18H3qw922S-YstvImEz7Ya2RERKsSS-__pd5L1pikDMDCa6ghBRwLjPUDB0hSQasIAd9sHUgN1JJlB-vRtEzAVdlrBH3iAJD00ruxT6dHgBN3CgUilZ2TUALzqPMF6BUqwC_V1cT05KTdjTQDKaC7ROj3wrFcuqAMjtubMWR7s"
                alt="Sophia Clark"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="max-w-md rounded-xl rounded-bl-none bg-surface-light dark:bg-surface-dark p-3 shadow-sm">
                <p className="text-sm">
                  Hey! How are you doing? I was wondering if you had time to
                  catch up this week. 😊
                </p>
                <p className="mt-1 text-right text-xs text-text-muted-light dark:text-text-muted-dark">
                  10:25 AM
                </p>
              </div>
            </div>

            {/* Outgoing Message */}
            <div className="flex items-end justify-end gap-2">
              <div className="max-w-md rounded-xl rounded-br-none bg-primary p-3 text-white shadow-sm">
                <p className="text-sm">
                  I'm doing great! This week’s a bit busy, but how about next
                  week?
                </p>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs text-blue-200">
                  <span>10:26 AM</span>
                  <Icon name="done_all" className="!text-base" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <footer className="border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 py-3">
          <div className="flex items-center gap-4">
            {['mood', 'attachment'].map((icon) => (
              <button
                key={icon}
                className="rounded-full p-2 text-text-muted-light hover:bg-primary/10 hover:text-primary dark:text-text-muted-dark dark:hover:bg-primary/20"
              >
                <Icon name={icon} />
              </button>
            ))}
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-background-light dark:bg-background-dark px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button className="rounded-full bg-primary p-2 text-white transition-transform hover:scale-105">
              <Icon name="send" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ChatApp;
