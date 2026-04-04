"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, X, Phone, ShieldCheck } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

export default function TrustedContacts({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("herway_trusted_contacts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load contacts", e);
      }
    }
    return [];
  });
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("herway_trusted_contacts", JSON.stringify(contacts));
  }, [contacts]);

  const addContact = () => {
    if (!newName || !newPhone) return;
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
    };
    setContacts([...contacts, newContact]);
    setNewName("");
    setNewPhone("");
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-800 z-[1000] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-600">
                      Trusted Contacts
                    </h2>
                    <p className="text-xs text-zinc-500">
                      These people will be notified in an emergency.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Add New */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Name (e.g. Mom)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  />
                </div>
                <button
                  onClick={addContact}
                  disabled={!newName || !newPhone}
                  className="px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    No contacts added yet.
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                            {contact.name}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeContact(contact.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                 <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    Contacts are stored locally on your device for privacy.
                 </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
