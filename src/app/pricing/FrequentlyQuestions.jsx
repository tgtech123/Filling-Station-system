"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import usePlatformStore from "@/store/usePlatformStore";

export default function FrequentlyQuestions() {
  const { platformName } = usePlatformStore();
  const [openId, setOpenId] = useState(null);

  const faqs = [
    {
      id: "1",
      question: "What is Flourish Station?",
      answer: `${platformName || "Flourish Station"} is a comprehensive fuel station management platform designed to streamline operations, boost efficiency, and maximize revenue. From pump control to staff management, financial tracking, and inventory oversight, we provide everything you need to run a modern filling station.`,
    },
    {
      id: "2",
      question: "How does the pricing work?",
      answer: `We offer flexible plans suited to stations of all sizes. Our Free plan lets you get started immediately. Pro and Pro Max plans unlock advanced features and higher staff limits. Enterprise plans enable multi-branch management. All paid plans are billed monthly or yearly with a 10% discount on annual billing.`,
    },
    {
      id: "3",
      question: "Can I manage multiple branch stations?",
      answer: `Yes! Our Enterprise plans are designed for multi-location operations. The Enterprise plan supports up to 3 branches, Enterprise Pro supports 5 branches, and Enterprise Max supports unlimited branches. Switch between stations instantly from your super manager dashboard and get consolidated reports across all locations.`,
    },
    {
      id: "4",
      question: "What payment methods do you accept?",
      answer: `We accept all major payment methods through Paystack: debit cards, credit cards, bank transfers, USSD, and mobile money. Payments are secure and encrypted. Tax is calculated automatically based on your country. You can upgrade or downgrade your plan anytime.`,
    },
    {
      id: "5",
      question: "Is my data secure?",
      answer: `Absolutely. All data is encrypted in transit and at rest. We use industry-standard security protocols, JWT authentication, and MongoDB with role-based access control. Your station data is isolated in our multi-tenant architecture. We regularly audit security and comply with data protection best practices.`,
    },
    {
      id: "6",
      question: "Do you offer customer support?",
      answer: `Yes! Free and Pro plans have community support. Pro Max and Enterprise plans include priority email support. We're committed to helping you succeed. Check our support page or contact us directly at support@flourishstation.com.`,
    },
    {
      id: "7",
      question: "Can I export my data?",
      answer: `Yes. All paid plan users can export their data in CSV format. Reports include shift summaries, financial records, staff performance, and inventory snapshots. Enterprise users get cross-branch export capabilities for consolidated analysis.`,
    },
    {
      id: "8",
      question: "What if I need to cancel my subscription?",
      answer: `You can cancel anytime, no long-term contracts required. Your station enters a 30-day grace period where you can access your data in read-only mode or export it. After 30 days, your data is securely deleted unless you restore your subscription.`,
    },
  ];

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Everything you need to know about {platformName || "Flourish Station"}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: parseInt(faq.id) * 0.05 }}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={openId === faq.id}
                aria-controls={`answer-${faq.id}`}
              >
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg">
                  {faq.question}
                </span>

                {/* Chevron — rotates 0° → 180° */}
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                </motion.div>
              </button>

              {/* Answer — smooth expand/collapse */}
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    id={`answer-${faq.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <p className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">
            Still have questions?
          </p>
          
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"

          >
             Contact us
          </Link>
          {/* <a
            href="mailto:support@flourishstation.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            Contact Us
          </a> */}
        </div>

      </div>
    </div>
  );
}
