"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { ExcelImportForm } from "@/components/admin/ExcelImportForm";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from "@/components/ui/animated-card";
import { AnimatedPage } from "@/components/ui/animated-page";
import { Upload, FileSpreadsheet, Users, Database, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ImportDataPage() {
  return (
    <AnimatedPage className="space-y-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
          <PageHeader
            title="Data Import Center"
            description="Seamlessly import customer data from CSV files with intelligent mapping and assignment."
          />
        </div>
      </motion.div>

      {/* Import Process Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <AnimatedCard className="glassmorphism border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <AnimatedCardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Upload CSV</h3>
            <p className="text-sm text-muted-foreground">
              Upload your customer data file with any column structure
            </p>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard className="glassmorphism border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
          <AnimatedCardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
              <FileSpreadsheet className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Map Columns</h3>
            <p className="text-sm text-muted-foreground">
              Intelligently map your CSV columns to CRM fields
            </p>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard className="glassmorphism border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <AnimatedCardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
              <Zap className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Import & Assign</h3>
            <p className="text-sm text-muted-foreground">
              Auto-assign customers by region or manually set defaults
            </p>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Import Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <ExcelImportForm />
      </motion.div>

      {/* Features Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Advanced Import Features
            </h3>
            <p className="text-muted-foreground">
              Powerful capabilities to streamline your data import process
            </p>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Database className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Smart Column Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect and suggest field mappings based on column names
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Regional Auto-Assignment</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign customers to employees based on their specialized regions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Custom Field Mapping</h4>
                  <p className="text-sm text-muted-foreground">
                    Map custom CSV columns to create additional customer data fields
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Data Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    Validate required fields and data formats before importing
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Upload className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Batch Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Import large datasets efficiently with real-time progress tracking
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4 text-cyan-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Preview & Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Preview imported data before final confirmation to ensure accuracy
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl" />
      </div>
    </AnimatedPage>
  );
}
