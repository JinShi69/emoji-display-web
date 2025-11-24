import React from 'react';
import Portfolio from './components/Portfolio';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen overflow-hidden bg-white text-slate-900 font-sans antialiased">
      <Portfolio />
    </div>
  );
};

export default App;