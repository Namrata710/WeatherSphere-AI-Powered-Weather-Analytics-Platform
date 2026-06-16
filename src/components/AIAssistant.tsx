import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Loader } from 'lucide-react';
import type { WeatherData } from '../types/weather';
import { getMoonPhaseName } from '../utils/weatherApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  data: WeatherData;
  isOpen: boolean;
  onClose: () => void;
}

function generateAIResponse(question: string, data: WeatherData): string {
  const q = question.toLowerCase();
  const { current, daily, city } = data;
  const today = daily[0];
  const tomorrow = daily[1];

  if (q.includes('umbrella') || q.includes('rain') || q.includes('wet')) {
    const isAskingTomorrow = q.includes('tomorrow');
    const day = isAskingTomorrow ? tomorrow : today;
    const rainPct = day?.precipitationProbability ?? 0;
    if (rainPct >= 70) return `Yes, definitely bring an umbrella! There's a ${rainPct}% chance of rain ${isAskingTomorrow ? 'tomorrow' : 'today'} in ${city.name}.`;
    if (rainPct >= 40) return `I'd suggest carrying an umbrella just in case. There's a ${rainPct}% chance of rain.`;
    return `No umbrella needed ${isAskingTomorrow ? 'tomorrow' : 'today'} — only a ${rainPct}% rain chance in ${city.name}. Enjoy the ${current.condition.toLowerCase()}!`;
  }

  if (q.includes('wear') || q.includes('clothes') || q.includes('dress') || q.includes('outfit')) {
    const feels = current.feelsLike;
    let advice = '';
    if (feels < 0) advice = 'Heavy winter coat, thermal layers, gloves, and hat.';
    else if (feels < 10) advice = 'Warm jacket, sweater, long pants, and closed shoes.';
    else if (feels < 18) advice = 'Light jacket or cardigan over a long-sleeve shirt.';
    else if (feels < 24) advice = 'Light shirt and pants. A thin layer for the evening.';
    else if (feels < 30) advice = 'Light, breathable clothes — t-shirt and shorts. Stay hydrated!';
    else advice = 'Minimal breathable clothing, light colors, sunhat, and sunscreen.';
    return `For ${city.name} (feels like ${Math.round(feels)}°C): ${advice}`;
  }

  if (q.includes('outdoor') || q.includes('exercise') || q.includes('run') || q.includes('walk')) {
    const uv = current.uvIndex;
    const wind = current.windSpeed;
    if (current.weatherCode >= 95) return `Stay indoors — there's an active thunderstorm in ${city.name}.`;
    if (current.weatherCode >= 61 && current.weatherCode <= 65) return `It's raining. Wear waterproof gear or wait for it to ease.`;
    if (uv > 8) return `High UV (${uv.toFixed(1)}). Apply SPF 50+, wear a hat, and avoid 11am–3pm.`;
    if (wind > 50) return `Strong winds (${Math.round(wind)} km/h). Consider indoor alternatives.`;
    return `Great conditions! ${Math.round(current.temperature)}°C with ${current.condition.toLowerCase()}. UV index ${uv.toFixed(1)} — ${uv > 5 ? 'apply sunscreen' : 'no sunscreen needed'}.`;
  }

  if (q.includes('forecast') || q.includes('week') || q.includes('next few')) {
    const summary = daily.slice(0, 5).map(d => {
      const date = new Date(d.date).toLocaleDateString([], { weekday: 'short' });
      return `${date}: ${Math.round(d.tempMax)}°/${Math.round(d.tempMin)}°, ${d.precipitationProbability}% rain`;
    }).join(' | ');
    return `5-day outlook for ${city.name}: ${summary}`;
  }

  if (q.includes('sunrise') || q.includes('sunset')) {
    const sr = new Date(data.sunriseToday).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ss = new Date(data.sunsetToday).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Sunrise at ${sr}, Sunset at ${ss} in ${city.name}.`;
  }

  if (q.includes('moon')) {
    return `Tonight's moon phase: ${getMoonPhaseName(data.moonPhase)} (${Math.round(Math.abs(0.5 - data.moonPhase) * 200)}% illumination).`;
  }

  if (q.includes('uv') || q.includes('sunscreen') || q.includes('sunburn')) {
    const uv = current.uvIndex;
    const label = uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : uv <= 7 ? 'High' : 'Very High';
    return `UV Index is ${uv.toFixed(1)} (${label}) in ${city.name}. ${uv > 5 ? 'Sunscreen recommended.' : uv > 2 ? 'Light sunscreen advisable.' : 'No special protection needed.'}`;
  }

  if (q.includes('humid')) {
    const h = current.humidity;
    const feel = h > 70 ? 'very muggy' : h > 50 ? 'somewhat humid' : h > 30 ? 'comfortable' : 'quite dry';
    return `Humidity is ${h}% in ${city.name}, which feels ${feel}.`;
  }

  if (q.includes('wind') || q.includes('windy')) {
    return `Wind is ${Math.round(current.windSpeed)} km/h in ${city.name}. ${current.windSpeed > 40 ? 'Quite breezy!' : current.windSpeed > 20 ? 'A moderate breeze.' : 'Light winds.'}`;
  }

  if (q.includes('travel') || q.includes('trip')) {
    const bestDay = daily.find(d => d.weatherCode <= 2 && d.precipitationProbability < 30);
    if (bestDay) {
      const date = new Date(bestDay.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      return `Best upcoming travel day for ${city.name}: ${date} — clear skies, only ${bestDay.precipitationProbability}% rain chance.`;
    }
    return `Some rain ahead for ${city.name}. Pack a waterproof jacket for flexibility.`;
  }

  return `Currently ${Math.round(current.temperature)}°C in ${city.name} (feels like ${Math.round(current.feelsLike)}°C) — ${current.condition}. Ask me about: umbrella, what to wear, outdoor activities, UV, humidity, wind, forecast, travel, sunrise/sunset, or moon phase!`;
}

export default function AIAssistant({ data, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    content: `Hi! I'm your weather assistant for ${data.city.name}. Ask me anything — "Do I need an umbrella?", "What should I wear?", "Is it good for running?"`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const response = generateAIResponse(userMsg.content, data);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
      setLoading(false);
    }, 600 + Math.random() * 400);
  };

  const quickQuestions = [
    'Do I need an umbrella?',
    'What should I wear today?',
    'Good for outdoor exercise?',
    "5-day forecast?",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-[340px] sm:w-[400px] z-50 transition-all duration-300">
      <div className="backdrop-blur-xl bg-slate-900/90 border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-medium text-sm">Weather Assistant</div>
            <div className="text-white/40 text-xs">AI-powered insights</div>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setMinimized(m => !m)} className="text-white/40 hover:text-white/70 transition-colors">
              {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/90'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="flex-shrink-0 text-xs text-white/60 bg-white/8 border border-white/10 rounded-full px-3 py-1 hover:bg-white/15 hover:text-white/80 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask about the weather..."
                  className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/25"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl px-3 transition-colors active:scale-95 transform duration-100"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
