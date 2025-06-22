'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Eye, Download, Trash2, Check, X, 
  AlertTriangle, Clock, Verified, Scan, Camera, 
  Languages, Tag, Search, Filter, Grid, List,
  FileImage, FileVideo, File, FileArchive,
  Zap, Brain, Shield, Calendar, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDropzone } from 'react-dropzone';
import type { Document, DocumentType, DocumentStatus, CountryCode, OCRData } from '@/lib/types';

interface DocumentManagerProps {
  customerId: string;
  customerName: string;
  destinationCountry: CountryCode;
  visaType: string;
  onDocumentUpload?: (document: Document) => void;
  onDocumentVerify?: (documentId: string, status: DocumentStatus) => void;
  onDocumentDelete?: (documentId: string) => void;
}

const documentTypeIcons: { [key in DocumentType]: React.ComponentType<any> } = {
  passport: FileText,
  birth_certificate: FileText,
  marriage_certificate: FileText,
  diploma: FileText,
  transcripts: FileText,
  work_experience: FileText,
  bank_statements: FileText,
  tax_returns: FileText,
  police_clearance: Shield,
  medical_certificate: FileText,
  ielts_toefl: FileText,
  photos: FileImage,
  sponsor_documents: FileText,
  property_documents: FileText,
  insurance: FileText,
  other: FileText
};

const documentTypeColors: { [key in DocumentType]: string } = {
  passport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  birth_certificate: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  marriage_certificate: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  diploma: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  transcripts: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  work_experience: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  bank_statements: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  tax_returns: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  police_clearance: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  medical_certificate: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  ielts_toefl: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  photos: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  sponsor_documents: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  property_documents: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
  insurance: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
};

const requiredDocuments: { [key: string]: DocumentType[] } = {
  'US': ['passport', 'birth_certificate', 'bank_statements', 'medical_certificate', 'police_clearance'],
  'CA': ['passport', 'birth_certificate', 'ielts_toefl', 'work_experience', 'bank_statements'],
  'AU': ['passport', 'birth_certificate', 'ielts_toefl', 'work_experience', 'medical_certificate'],
  'UK': ['passport', 'birth_certificate', 'ielts_toefl', 'bank_statements', 'sponsor_documents'],
  'DE': ['passport', 'birth_certificate', 'diploma', 'bank_statements', 'insurance']
};

export function SmartDocumentManager({ 
  customerId, 
  customerName, 
  destinationCountry, 
  visaType,
  onDocumentUpload,
  onDocumentVerify,
  onDocumentDelete 
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      customerId,
      type: 'passport',
      name: 'Passport - John Doe',
      originalName: 'passport_john_doe.pdf',
      fileUrl: '/api/documents/1',
      status: 'verified',
      uploadedAt: '2025-06-20T10:00:00Z',
      uploadedBy: 'admin',
      verifiedAt: '2025-06-20T14:30:00Z',
      verifiedBy: 'admin',
      expiryDate: '2030-06-15T00:00:00Z',
      isRequired: true,
      country: destinationCountry,
      size: 2048576,
      mimeType: 'application/pdf',
      version: 1,
      ocrData: {
        text: 'PASSPORT\nUnited States of America\nJohn Doe\nDate of Birth: 01/15/1990\nPassport No: 123456789',
        confidence: 0.95,
        extractedFields: {
          name: 'John Doe',
          passportNumber: '123456789',
          dateOfBirth: '01/15/1990',
          expiryDate: '06/15/2030'
        },
        language: 'en',
        processedAt: '2025-06-20T10:05:00Z'
      }
    },
    {
      id: '2',
      customerId,
      type: 'bank_statements',
      name: 'Bank Statement - May 2025',
      originalName: 'bank_statement_may_2025.pdf',
      fileUrl: '/api/documents/2',
      status: 'pending',
      uploadedAt: '2025-06-21T09:00:00Z',
      uploadedBy: 'admin',
      isRequired: true,
      country: destinationCountry,
      size: 1524288,
      mimeType: 'application/pdf',
      version: 1
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [ocrProgress, setOcrProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0;
          if (current >= 100) {
            clearInterval(uploadInterval);
            // Start OCR processing
            simulateOCRProcessing(fileId, file);
            return prev;
          }
          return { ...prev, [fileId]: current + 10 };
        });
      }, 200);

      // Create document object
      const newDocument: Document = {
        id: fileId,
        customerId,
        type: 'other', // Will be determined by AI
        name: file.name,
        originalName: file.name,
        fileUrl: URL.createObjectURL(file),
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current_user',
        isRequired: false,
        country: destinationCountry,
        size: file.size,
        mimeType: file.type,
        version: 1
      };

      setDocuments(prev => [...prev, newDocument]);
      onDocumentUpload?.(newDocument);
    });
  }, [customerId, destinationCountry, onDocumentUpload]);

  const simulateOCRProcessing = (fileId: string, file: File) => {
    setOcrProgress(prev => ({ ...prev, [fileId]: 0 }));
    const ocrInterval = setInterval(() => {
      setOcrProgress(prev => {
        const current = prev[fileId] || 0;
        if (current >= 100) {
          clearInterval(ocrInterval);
          // Update document with OCR results
          setDocuments(prevDocs => 
            prevDocs.map(doc => 
              doc.id === fileId 
                ? {
                    ...doc,
                    type: detectDocumentType(file.name),
                    ocrData: generateMockOCRData(file.name)
                  }
                : doc
            )
          );
          return prev;
        }
        return { ...prev, [fileId]: current + 20 };
      });
    }, 300);
  };

  const detectDocumentType = (filename: string): DocumentType => {
    const name = filename.toLowerCase();
    if (name.includes('passport')) return 'passport';
    if (name.includes('birth')) return 'birth_certificate';
    if (name.includes('marriage')) return 'marriage_certificate';
    if (name.includes('diploma') || name.includes('degree')) return 'diploma';
    if (name.includes('transcript')) return 'transcripts';
    if (name.includes('bank')) return 'bank_statements';
    if (name.includes('tax')) return 'tax_returns';
    if (name.includes('police')) return 'police_clearance';
    if (name.includes('medical')) return 'medical_certificate';
    if (name.includes('ielts') || name.includes('toefl')) return 'ielts_toefl';
    if (name.includes('photo')) return 'photos';
    return 'other';
  };

  const generateMockOCRData = (filename: string): OCRData => {
    return {
      text: `Extracted text from ${filename}...`,
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      extractedFields: {
        documentType: detectDocumentType(filename),
        extractedAt: new Date().toISOString()
      },
      language: 'en',
      processedAt: new Date().toISOString()
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getCompletionPercentage = () => {
    const required = requiredDocuments[destinationCountry] || [];
    const uploaded = documents.filter(doc => required.includes(doc.type));
    return Math.round((uploaded.length / required.length) * 100);
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'verified': return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected': return <X className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'received': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const DocumentCard = ({ document }: { document: Document }) => {
    const IconComponent = documentTypeIcons[document.type];
    const isUploading = uploadProgress[document.id] !== undefined && uploadProgress[document.id] < 100;
    const isProcessingOCR = ocrProgress[document.id] !== undefined && ocrProgress[document.id] < 100;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
      >
        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 rounded-lg flex flex-col items-center justify-center z-10">
            <Upload className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium mb-2">Uploading...</p>
            <Progress value={uploadProgress[document.id]} className="w-3/4" />
          </div>
        )}

        {/* OCR Progress */}
        {isProcessingOCR && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 rounded-lg flex flex-col items-center justify-center z-10">
            <Scan className="w-8 h-8 text-green-600 mb-2 animate-pulse" />
            <p className="text-sm font-medium mb-2">Processing with AI...</p>
            <Progress value={ocrProgress[document.id]} className="w-3/4" />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${documentTypeColors[document.type]}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(document.status)}
              <h3 className="font-medium text-sm truncate">{document.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {document.type.replace('_', ' ')}
              </Badge>
              {document.isRequired && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              {document.ocrData && (
                <Badge variant="secondary" className="text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Processed
                </Badge>
              )}
            </div>

            {document.ocrData && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <p>Confidence: {Math.round(document.ocrData.confidence * 100)}%</p>
                {Object.entries(document.ocrData.extractedFields).slice(0, 2).map(([key, value]) => (
                  <p key={key}>{key}: {value}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
              <span>{(document.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onDocumentDelete?.(document.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Manager
            <Badge variant="secondary">{documents.length} files</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completion: {getCompletionPercentage()}%
            </div>
            <Progress value={getCompletionPercentage()} className="w-20" />
          </div>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files or click to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={(value: DocumentStatus | 'all') => setFilterStatus(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document Grid/List */}
        <ScrollArea className="h-[400px]">
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No documents found</p>
            </div>
          )}
        </ScrollArea>

        {/* Required Documents Checklist */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Required Documents for {destinationCountry}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(requiredDocuments[destinationCountry] || []).map((docType) => {
              const hasDocument = documents.some(doc => doc.type === docType);
              const IconComponent = documentTypeIcons[docType];
              
              return (
                <div
                  key={docType}
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    hasDocument 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {hasDocument ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs">{docType.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
