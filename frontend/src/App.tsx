import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
} from '@clerk/clerk-react';
import './App.css';
import Chat from './components/Chat';

const CLERK_PUBLISHABLE_KEY =
  'pk_test_YWxpdmUtc2x1Zy04My5jbGVyay5hY2NvdW50cy5kZXYk';

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <div className="min-h-screen app-background">
        <SignedIn>
          <Chat />
        </SignedIn>

        <SignedOut>
          <div className="min-h-screen flex items-center justify-center px-4 app-background">
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                  Welcome to Pulse
                </h1>
                <p className="text-slate-300">
                  Secure end-to-end encrypted messaging
                </p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-slate-300',
                      formButtonPrimary:
                        'bg-blue-600 hover:bg-blue-700 transition-colors',
                      formFieldInput:
                        'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400',
                      formFieldLabel: 'text-white',
                      footerActionLink: 'text-blue-400 hover:text-blue-300',
                      identityPreviewText: 'text-white',
                      identityPreviewEditButton:
                        'text-blue-400 hover:text-blue-300',
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
