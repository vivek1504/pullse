import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
} from '@clerk/clerk-react';
import './App.css';
import Chat from './components/Chat';

const CLERK_PUBLISHABLE_KEY =
  'pk_test_YWxpdmUtc2x1Zy04My5jbGVyay5hY2NvdW50cy5kZXYk';

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
        <SignedIn>
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">ChatApp</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-white/70 text-sm font-medium">
                  Welcome back!
                </div>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10',
                      userButtonPopoverCard:
                        'bg-white/10 backdrop-blur-md border border-white/20',
                    },
                  }}
                />
              </div>
            </div>
          </header>

          {/* Main Chat Area */}
          <main className="flex-1">
            <Chat />
          </main>
        </SignedIn>

        <SignedOut>
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome to ChatApp
                </h1>
                <p className="text-white/70">
                  Connect with others in real-time messaging
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-white/70',
                      formButtonPrimary:
                        'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
                      formFieldInput:
                        'bg-white/10 border-white/20 text-white placeholder:text-white/50',
                      formFieldLabel: 'text-white',
                      footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                      identityPreviewText: 'text-white',
                      identityPreviewEditButton:
                        'text-indigo-400 hover:text-indigo-300',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </SignedOut>
      </div>
    </ClerkProvider>
  );
}

export default App;
