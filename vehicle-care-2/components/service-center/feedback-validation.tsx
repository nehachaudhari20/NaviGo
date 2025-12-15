"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Star,
  Send
} from "lucide-react"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FeedbackValidationProps {
  appointmentId?: string
  predictionId?: string
  vehicleId?: string
}

export default function FeedbackValidation({
  appointmentId,
  predictionId,
  vehicleId,
}: FeedbackValidationProps) {
  const [formData, setFormData] = useState({
    actualIssue: "",
    predictionAccurate: true,
    accuracyScore: 100,
    customerFeedback: "",
    technicianNotes: "",
    partsUsed: [] as string[],
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API call to submit feedback
    console.log("Feedback submitted:", formData)
    setSubmitted(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        actualIssue: "",
        predictionAccurate: true,
        accuracyScore: 100,
        customerFeedback: "",
        technicianNotes: "",
        partsUsed: [],
      })
    }, 3000)
  }

  const getAccuracyColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50/30 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            Service Feedback & Validation
          </CardTitle>
          {submitted && (
            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
              Submitted ✓
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Validate prediction accuracy and provide feedback for AI learning
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prediction Accuracy */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Was the prediction accurate?
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={formData.predictionAccurate ? "default" : "outline"}
                className={formData.predictionAccurate ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => setFormData({ ...formData, predictionAccurate: true })}
              >
                <CheckCircle2 size={14} className="mr-1.5" />
                Accurate
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!formData.predictionAccurate ? "default" : "outline"}
                className={!formData.predictionAccurate ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => setFormData({ ...formData, predictionAccurate: false })}
              >
                <XCircle size={14} className="mr-1.5" />
                Inaccurate
              </Button>
            </div>
          </div>

          {/* Actual Issue */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Actual Issue Found
            </label>
            <Input
              value={formData.actualIssue}
              onChange={(e) => setFormData({ ...formData, actualIssue: e.target.value })}
              placeholder="Describe the actual issue found during service"
              className="text-sm"
            />
          </div>

          {/* Accuracy Score */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Accuracy Score (0-100)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.accuracyScore}
                onChange={(e) => setFormData({ ...formData, accuracyScore: parseInt(e.target.value) || 0 })}
                className="w-24 text-sm"
              />
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      formData.accuracyScore >= 90
                        ? "bg-green-600"
                        : formData.accuracyScore >= 70
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${formData.accuracyScore}%` }}
                  ></div>
                </div>
              </div>
              <span className={`text-sm font-bold ${getAccuracyColor(formData.accuracyScore)}`}>
                {formData.accuracyScore}%
              </span>
            </div>
          </div>

          {/* Parts Used */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Parts Used
            </label>
            <Input
              value={formData.partsUsed.join(", ")}
              onChange={(e) => setFormData({ 
                ...formData, 
                partsUsed: e.target.value.split(",").map(p => p.trim()).filter(p => p) 
              })}
              placeholder="Brake pads, Rotors, Brake fluid (comma separated)"
              className="text-sm"
            />
          </div>

          {/* Technician Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Technician Notes
            </label>
            <Textarea
              value={formData.technicianNotes}
              onChange={(e) => setFormData({ ...formData, technicianNotes: e.target.value })}
              placeholder="Additional observations, recommendations, or notes..."
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Customer Feedback */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Customer Feedback (Optional)
            </label>
            <Textarea
              value={formData.customerFeedback}
              onChange={(e) => setFormData({ ...formData, customerFeedback: e.target.value })}
              placeholder="Customer comments or feedback about the service..."
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              This feedback helps improve AI predictions
            </div>
            <Button
              type="submit"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={submitted || !formData.actualIssue}
            >
              <Send size={14} className="mr-1.5" />
              Submit Feedback
            </Button>
          </div>
        </form>

        {/* Recent Feedback Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600 mb-1">Avg Accuracy</p>
              <p className="text-lg font-bold text-green-600">87%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600 mb-1">Total Feedback</p>
              <p className="text-lg font-bold text-gray-900">234</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600 mb-1">This Month</p>
              <p className="text-lg font-bold text-blue-600">+12%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

