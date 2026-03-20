import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, AlertCircle, Users, Package, TrendingUp, Shield, Smartphone, Eye } from "lucide-react";

// Mock data for dashboard
const dashboardData = {
  date: "২০২৬-০৩-২০",
  totalTransactions: 1250,
  totalQuantityKg: 2500,
  uniqueBeneficiaries: 1200,
  duplicateAttempts: 15,
  quotaViolations: 3,
  systemHealth: 99.95,
};

const dailyTransactionData = [
  { time: "০৬:০০", transactions: 50, quantity: 100 },
  { time: "০৮:০০", transactions: 150, quantity: 300 },
  { time: "১০:০০", transactions: 200, quantity: 400 },
  { time: "১২:০০", transactions: 250, quantity: 500 },
  { time: "১৪:০০", transactions: 300, quantity: 600 },
  { time: "১৬:০০", transactions: 200, quantity: 400 },
  { time: "১৮:০০", transactions: 100, quantity: 200 },
];

const dealerPerformanceData = [
  { name: "আহমেদের দোকান", transactions: 50, quantity: 100 },
  { name: "করিমের বিতরণ", transactions: 45, quantity: 90 },
  { name: "ফাতিমা স্টোর", transactions: 40, quantity: 80 },
  { name: "রহিমের কেন্দ্র", transactions: 35, quantity: 70 },
  { name: "সালমার খাদ্য", transactions: 30, quantity: 60 },
];

const beneficiaryDistributionData = [
  { name: "বিধবা", value: 400, color: "#1e3a8a" },
  { name: "বয়স্ক", value: 300, color: "#0d9488" },
  { name: "প্রতিবন্ধী", value: 250, color: "#7c3aed" },
  { name: "দরিদ্র পরিবার", value: 250, color: "#dc2626" },
];

const sampleTransactions = [
  {
    id: "TXN-001",
    beneficiary: "ফাতিমা বেগম",
    dealer: "আহমেদের দোকান",
    quantity: 2,
    product: "চাল",
    time: "১২:৩০",
    status: "সফল",
    faceVerification: "সফল",
  },
  {
    id: "TXN-002",
    beneficiary: "আয়েশা খাতুন",
    dealer: "করিমের বিতরণ",
    quantity: 2,
    product: "ময়দা",
    time: "১২:৪৫",
    status: "সফল",
    faceVerification: "সফল",
  },
  {
    id: "TXN-003",
    beneficiary: "জামিলা বেগম",
    dealer: "ফাতিমা স্টোর",
    quantity: 2,
    product: "চাল",
    time: "১৩:০০",
    status: "ডুপ্লিকেট প্রতিরোধ",
    faceVerification: "ব্যর্থ",
  },
];

const sampleDealers = [
  {
    id: "DLR-001",
    name: "আহমেদের দোকান",
    status: "অনুমোদিত",
    registrationNumber: "BRN-2024-001",
    phone: "+8801700000001",
  },
  {
    id: "DLR-002",
    name: "করিমের বিতরণ",
    status: "অনুমোদিত",
    registrationNumber: "BRN-2024-002",
    phone: "+8801700000002",
  },
  {
    id: "DLR-003",
    name: "নতুন দোকান",
    status: "অপেক্ষমাণ",
    registrationNumber: "BRN-2024-003",
    phone: "+8801700000003",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionData, setTransactionData] = useState({
    beneficiary: "",
    quantity: 2,
    product: "rice",
  });

  const handleRecordTransaction = () => {
    setShowTransactionForm(false);
    setTransactionData({ beneficiary: "", quantity: 2, product: "rice" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">OMS নিয়ন্ত্রণ প্ল্যাটফর্ম</h1>
              <p className="text-xs text-slate-500">জাতীয় খাদ্য বিতরণ ব্যবস্থাপনা</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              সিস্টেম সক্রিয়
            </Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">মোট লেনদেন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{dashboardData.totalTransactions.toLocaleString('bn-BD')}</div>
              <p className="text-xs text-slate-500 mt-1">আজকের তারিখে</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">মোট পরিমাণ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">{dashboardData.totalQuantityKg.toLocaleString('bn-BD')} কেজি</div>
              <p className="text-xs text-slate-500 mt-1">চাল এবং ময়দা</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">উপকারভোগী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{dashboardData.uniqueBeneficiaries.toLocaleString('bn-BD')}</div>
              <p className="text-xs text-slate-500 mt-1">অনন্য ব্যক্তি</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">ডুপ্লিকেট প্রতিরোধ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{dashboardData.duplicateAttempts}</div>
              <p className="text-xs text-slate-500 mt-1">চেষ্টা ব্লক করা</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">সিস্টেম স্বাস্থ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{dashboardData.systemHealth}%</div>
              <p className="text-xs text-slate-500 mt-1">আপটাইম</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              লেনদেন
            </TabsTrigger>
            <TabsTrigger value="dealers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              দোকানদার
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              পর্যবেক্ষণ
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              নিরাপত্তা
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transaction Timeline */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>দৈনিক লেনদেন প্রবাহ</CardTitle>
                  <CardDescription>সময় অনুযায়ী লেনদেন এবং পরিমাণ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyTransactionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="transactions" stroke="#1e3a8a" strokeWidth={2} name="লেনদেন" />
                      <Line type="monotone" dataKey="quantity" stroke="#0d9488" strokeWidth={2} name="পরিমাণ (কেজি)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Beneficiary Distribution */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>উপকারভোগী বিভাগ বিতরণ</CardTitle>
                  <CardDescription>বিভিন্ন ক্যাটাগরিতে বিভাজন</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={beneficiaryDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {beneficiaryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Dealer Performance */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>দোকানদার কর্মক্ষমতা</CardTitle>
                <CardDescription>শীর্ষ ৫ দোকানদার আজকের পরিসংখ্যান</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dealerPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Legend />
                    <Bar dataKey="transactions" fill="#1e3a8a" name="লেনদেন" />
                    <Bar dataKey="quantity" fill="#0d9488" name="পরিমাণ (কেজি)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>সম্প্রতি লেনদেন</CardTitle>
                    <CardDescription>আজকের সর্বশেষ লেনদেন রেকর্ড</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowTransactionForm(!showTransactionForm)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    + নতুন লেনদেন
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showTransactionForm && (
                  <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-slate-900 mb-3">নতুন লেনদেন রেকর্ড করুন</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700">উপকারভোগী নাম</label>
                        <input
                          type="text"
                          placeholder="উপকারভোগীর নাম প্রবেশ করুন"
                          value={transactionData.beneficiary}
                          onChange={(e) => setTransactionData({ ...transactionData, beneficiary: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700">পরিমাণ (কেজি)</label>
                          <input
                            type="number"
                            value={transactionData.quantity}
                            onChange={(e) => setTransactionData({ ...transactionData, quantity: parseFloat(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">পণ্য</label>
                          <select
                            value={transactionData.product}
                            onChange={(e) => setTransactionData({ ...transactionData, product: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                          >
                            <option value="rice">চাল</option>
                            <option value="flour">ময়দা</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleRecordTransaction}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          লেনদেন রেকর্ড করুন
                        </Button>
                        <Button 
                          onClick={() => setShowTransactionForm(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {sampleTransactions.map((txn) => (
                    <div key={txn.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{txn.beneficiary}</p>
                          <p className="text-sm text-slate-600">{txn.dealer}</p>
                        </div>
                        <Badge 
                          variant={txn.status === "সফল" ? "default" : "destructive"}
                          className={txn.status === "সফল" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {txn.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">পরিমাণ:</span>
                          <p className="font-medium text-slate-900">{txn.quantity} কেজি {txn.product}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">সময়:</span>
                          <p className="font-medium text-slate-900">{txn.time}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">মুখ যাচাই:</span>
                          <p className={`font-medium ${txn.faceVerification === "সফল" ? "text-green-600" : "text-red-600"}`}>
                            {txn.faceVerification}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">লেনদেন ID:</span>
                          <p className="font-medium text-slate-900 text-xs">{txn.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dealers Tab */}
          <TabsContent value="dealers" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>নিবন্ধিত দোকানদার</CardTitle>
                <CardDescription>সমস্ত দোকানদারের তালিকা এবং অনুমোদন স্ট্যাটাস</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleDealers.map((dealer) => (
                    <div 
                      key={dealer.id}
                      onClick={() => setSelectedDealer(selectedDealer?.id === dealer.id ? null : dealer)}
                      className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{dealer.name}</p>
                          <p className="text-sm text-slate-600">{dealer.registrationNumber}</p>
                        </div>
                        <Badge 
                          variant={dealer.status === "অনুমোদিত" ? "default" : "secondary"}
                          className={dealer.status === "অনুমোদিত" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {dealer.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">ফোন:</span>
                          <p className="font-medium text-slate-900">{dealer.phone}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">আইডি:</span>
                          <p className="font-medium text-slate-900 text-xs">{dealer.id}</p>
                        </div>
                      </div>
                      {selectedDealer?.id === dealer.id && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 w-full"
                            disabled={dealer.status === "অনুমোদিত"}
                          >
                            {dealer.status === "অনুমোদিত" ? "ইতিমধ্যে অনুমোদিত" : "অনুমোদন করুন"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>সিস্টেম সতর্কতা</CardTitle>
                  <CardDescription>গুরুত্বপূর্ণ সিস্টেম ইভেন্ট</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900">উচ্চ লেনদেন ভলিউম</p>
                      <p className="text-yellow-800">দোকান #5 এ স্বাভাবিকের চেয়ে ৫০% বেশি লেনদেন</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900">সফল সিঙ্ক্রোনাইজেশন</p>
                      <p className="text-green-800">সমস্ত মোবাইল ডিভাইস সফলভাবে সিঙ্ক করা হয়েছে</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-900">ডুপ্লিকেট প্রতিরোধ</p>
                      <p className="text-red-800">১৫টি ডুপ্লিকেট লেনদেন চেষ্টা আজ ব্লক করা হয়েছে</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>সিস্টেম পরিসংখ্যান</CardTitle>
                  <CardDescription>রিয়েল-টাইম সিস্টেম মেট্রিক্স</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">API প্রতিক্রিয়া সময়</span>
                      <span className="text-sm font-medium text-green-600">245ms</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">ডাটাবেস সংযোগ</span>
                      <span className="text-sm font-medium text-green-600">42/100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">ক্যাশ হিট রেট</span>
                      <span className="text-sm font-medium text-green-600">87%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">আপটাইম</span>
                      <span className="text-sm font-medium text-green-600">99.95%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "99.95%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>নিরাপত্তা বৈশিষ্ট্য</CardTitle>
                <CardDescription>OMS সিস্টেমের নিরাপত্তা ব্যবস্থা</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">মুখ স্বীকৃতি</h3>
                    </div>
                    <p className="text-sm text-slate-600">প্রতিটি লেনদেনে ৯৫% নির্ভুলতার সাথে মুখ যাচাই</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">ডুপ্লিকেট প্রতিরোধ</h3>
                    </div>
                    <p className="text-sm text-slate-600">রিয়েল-টাইম ডেটাবেস চেক দ্বারা একই দিনে দুবার বিতরণ প্রতিরোধ</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">কোটা প্রয়োগ</h3>
                    </div>
                    <p className="text-sm text-slate-600">মাসিক এবং দৈনিক সীমা স্বয়ংক্রিয়ভাবে প্রয়োগ করা হয়</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">অডিট ট্রেইল</h3>
                    </div>
                    <p className="text-sm text-slate-600">সমস্ত লেনদেন এবং ব্যবহারকারী কার্যকলাপ সম্পূর্ণভাবে লগ করা হয়</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">এনক্রিপশন</h3>
                    </div>
                    <p className="text-sm text-slate-600">TLS 1.3 এবং AES-256 দিয়ে সমস্ত ডেটা এনক্রিপ্ট করা হয়</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">অফলাইন সমর্থন</h3>
                    </div>
                    <p className="text-sm text-slate-600">মোবাইল অ্যাপ 2G সংযোগে অফলাইনে কাজ করে</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="container max-w-7xl mx-auto px-4 py-6 text-center text-sm text-slate-600">
          <p>OMS জাতীয় নিয়ন্ত্রণ প্ল্যাটফর্ম | খাদ্য মন্ত্রণালয়, বাংলাদেশ সরকার</p>
          <p className="mt-1">সংস্করণ ১.০.০ | এমভিপি প্রোটোটাইপ</p>
        </div>
      </footer>
    </div>
  );
}
