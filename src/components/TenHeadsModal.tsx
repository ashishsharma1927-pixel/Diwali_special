import React from 'react';
import { X, ShieldCheck, Flame } from 'lucide-react';

interface TenHeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HeadMeaning {
  head: string;
  sanskrit: string;
  meaning: string;
  virtue: string;
  virtueDesc: string;
}

export const tenHeadsData: HeadMeaning[] = [
  {
    head: '1st Head',
    sanskrit: 'कामा (Kama)',
    meaning: 'Lust & Unchecked Desires',
    virtue: 'Purity & Devotion (Bhakti)',
    virtueDesc: 'Chanelling earthly desires toward spiritual truth and unconditional love.',
  },
  {
    head: '2nd Head',
    sanskrit: 'क्रोध (Krodha)',
    meaning: 'Wrath & Destructive Fury',
    virtue: 'Patience & Compassion (Kshama)',
    virtueDesc: 'Calm equanimity in the face of provocation and war.',
  },
  {
    head: '3rd Head',
    sanskrit: 'मोह (Moha)',
    meaning: 'Delusion & False Attachment',
    virtue: 'Discernment (Viveka)',
    virtueDesc: 'Seeing reality as it is, unbound by illusions of ownership.',
  },
  {
    head: '4th Head',
    sanskrit: 'लोभ (Lobha)',
    meaning: 'Greed & Inordinate Thirst',
    virtue: 'Contentment & Charity (Santosha)',
    virtueDesc: 'Generosity and abundance consciousness, renouncing royal wealth for exile.',
  },
  {
    head: '5th Head',
    sanskrit: 'मद (Mada)',
    meaning: 'Pride & Intoxication of Power',
    virtue: 'Humility (Vinaya)',
    virtueDesc: 'Treating the humble squirrel and kings with equal sacred respect.',
  },
  {
    head: '6th Head',
    sanskrit: 'मात्सर्य (Matsarya)',
    meaning: 'Envy & Jealousy of Others',
    virtue: 'Sympathetic Joy (Mudita)',
    virtueDesc: 'Celebrating the prosperity and noble deeds of all living beings.',
  },
  {
    head: '7th Head',
    sanskrit: 'स्वार्थ (Swartha)',
    meaning: 'Selfishness & Egocentric Greed',
    virtue: 'Selfless Service (Seva)',
    virtueDesc: 'Dedication of life to the well-being of the kingdom and Dharma.',
  },
  {
    head: '8th Head',
    sanskrit: 'अन्याय (Anyaya)',
    meaning: 'Injustice & Dishonor',
    virtue: 'Righteous Conduct (Nyaya / Dharma)',
    virtueDesc: 'Unwavering commitment to truth even at personal sacrifice.',
  },
  {
    head: '9th Head',
    sanskrit: 'अमानवता (Amanavta)',
    meaning: 'Cruelty & Lack of Empathy',
    virtue: 'Universal Mercy (Karuna)',
    virtueDesc: 'Honoring even fallen enemies with funeral rites and dignity.',
  },
  {
    head: '10th Head (Center)',
    sanskrit: 'अहंकार (Ahankara)',
    meaning: 'Supreme Ego & Defiance of God',
    virtue: 'Surrender to Truth (Satya & Atmajnana)',
    virtueDesc: 'Recognizing the divine presence in all cosmos, destroying the illusion of ego.',
  },
];

export const TenHeadsModal: React.FC<TenHeadsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="badge"><Flame size={14} /> Sacred Wisdom</span>
            <h3>The 10 Heads of Ravana & The 10 Virtues of Rama</h3>
            <p className="subtitle">
              Why Lord Rama targeted the 10 heads of Dashanana and what Dussehra teaches humanity today.
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        <div className="heads-grid">
          {tenHeadsData.map((item, idx) => (
            <div key={idx} className="head-card">
              <div className="head-badge">{item.head}</div>
              <h4 className="head-sanskrit">{item.sanskrit}</h4>
              <p className="head-meaning">{item.meaning}</p>
              <div className="virtue-box">
                <div className="virtue-title">
                  <ShieldCheck size={14} className="virtue-icon" />
                  <span>{item.virtue}</span>
                </div>
                <p className="virtue-desc">{item.virtueDesc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <p className="footer-shloka">
            &ldquo;अधर्म पर धर्म की विजय, असत्य पर सत्य की विजय — यही है विजयादशमी का पावन संदेश।&rdquo;
          </p>
          <button className="gold-btn" onClick={onClose}>
            Conquer Inner Darkness
          </button>
        </div>
      </div>
    </div>
  );
};
