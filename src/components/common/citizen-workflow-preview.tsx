import React, { useMemo, useRef, useEffect, useState } from 'react'
import {
  Card,
  Chip,
  Divider,
  Progress,
  Input,
  Textarea,
  Select,
  SelectItem,
  Checkbox,
  RadioGroup,
  Radio,
  DatePicker,
  TimeInput
} from '@heroui/react'
import {
  FileText,
  User,
  Bell,
  CreditCard,
  Clock,
  FileCheck,
  ArrowDown,
  Flag,
  Hash,
  Mail,
  Phone,
  Link,
  CheckSquare,
  Type,
  Upload,
  Globe,
  Lock,
  Building2,
  Briefcase,
  ClipboardList,
  Banknote,
  Receipt,
  FileOutput,
  Users,
  AlertCircle
} from 'lucide-react'

// ============================================================================
// TYPES - สำหรับ Citizen Preview
// ============================================================================

export interface CitizenStep {
  id: string
  order: number
  title: string
  description: string
  icon: React.ReactNode
  type: 'start' | 'document' | 'officer' | 'payment' | 'notification' | 'timeline' | 'end'
  estimatedTime?: string
  fee?: number
  documents?: string[]
  responsible?: string
  isRequired?: boolean
  // Extended data from workflow node
  nodeData?: {
    method?: string
    label?: string
    inputFields?: Array<{
      id: string
      label: string
      type: string
      fieldName: string
      required?: boolean
      placeholder?: string
      options?: string[]
    }>
    sampleDocuments?: Array<{
      id: string
      name: string
      description?: string
      isPrivate?: boolean
    }>
    conditions?: Array<{
      id: string
      field: string
      operator: string
      value: string
    }>
    formLayout?: any
    feeType?: string
    currency?: string
    notificationType?: string
    notificationRecipients?: string[]
    httpMethod?: string
    httpUrl?: string
    templateData?: any
    documentMappings?: any[]
    rawData?: any
    // NODE_RESPONSIBLE fields
    ministry?: string
    ministryLabel?: string
    department?: string
    departmentLabel?: string
    responsibleRole?: string
    responsibleRoleLabel?: string
    taskManager?: string[]
    taskManagerLabels?: string[]
    responsibilityDetails?: string
    // NODE_FEE fields
    feeAmount?: number
    feeDescription?: string
    paymentMethods?: string[]
    // NODE_END fields
    outputDescription?: string
    outputDocuments?: string[]
    // NODE_NOTIFICATION fields
    notificationTitle?: string
    notificationDescription?: string
    // NODE_DOCUMENT fields
    documentType?: string
    documentsCount?: number
    // NODE_TIMELINE fields
    timeline?: string
    deadline?: string
    timelineDescription?: string
  }
}

export interface CitizenWorkflowPreviewProps {
  serviceName: string
  serviceDescription?: string
  steps: CitizenStep[]
  totalEstimatedDays?: number
  totalFee?: number
  className?: string
  variant?: 'vertical' | 'horizontal' | 'compact'
}

// ============================================================================
// HELPER - แปลง workflow nodes เป็น citizen steps
// ============================================================================

// Helper functions for labels
function getMinistryLabel(key: string): string {
  const ministries: Record<string, string> = {
    'ministry_of_finance': 'ກະຊວງການເງິນ',
    'ministry_of_health': 'ກະຊວງສາທາລະນະສຸກ',
    'ministry_of_education': 'ກະຊວງສຶກສາທິການ',
    'ministry_of_interior': 'ກະຊວງພາຍໃນ',
    'ministry_of_foreign_affairs': 'ກະຊວງການຕ່າງປະເທດ',
    'ministry_of_agriculture': 'ກະຊວງກະສິກຳ',
    'ministry_of_technology': 'ກະຊວງເຕັກໂນໂລຊີ',
  }
  return ministries[key] || key || '-'
}

function getDepartmentLabel(key: string): string {
  const departments: Record<string, string> = {
    'consular': 'ກົມກົງສຸນ',
    'admin': 'ພະແນກບໍລິຫານ',
    'hr': 'ພະແນກບຸກຄະລາກອນ',
    'finance': 'ພະແນກການເງິນ',
    'it': 'ພະແນກເຕັກໂນໂລຊີ',
    'operations': 'ພະແນກປະຕິບັດງານ',
    'legal': 'ພະແນກກົດໝາຍ',
    'planning': 'ພະແນກວາງແຜນ',
  }
  return departments[key] || key || '-'
}

function getResponsibleRoleLabel(key: string): string {
  const roles: Record<string, string> = {
    'director': 'ຜູ້ອຳນວຍການ',
    'deputy_director': 'ຮອງຜູ້ອຳນວຍການ',
    'department_head': 'ຫົວໜ້າພະແນກ',
    'team_lead': 'ຫົວໜ້າທີມ',
    'senior_officer': 'ເຈົ້າໜ້າທີ່ອາວຸໂສ',
    'officer': 'ເຈົ້າໜ້າທີ່',
    'staff': 'ພະນັກງານ',
  }
  return roles[key] || key || '-'
}

function getTaskLabel(key: string): string {
  const tasks: Record<string, string> = {
    'document_review': 'ກວດສອບເອກະສານ',
    'approval': 'ອະນຸມັດ',
    'verification': 'ຢັ້ງຢືນ',
    'processing': 'ປະມວນຜົນ',
    'data_entry': 'ບັນທຶກຂໍ້ມູນ',
    'quality_check': 'ກວດຄຸນນະພາບ',
    'final_review': 'ກວດສອບສຸດທ້າຍ',
  }
  return tasks[key] || key || '-'
}

function getNotificationTypeLabel(key: string): string {
  const types: Record<string, string> = {
    'email': 'ອີເມວ (Email)',
    'sms': 'ຂໍ້ຄວາມ (SMS)',
    'whatsapp_phone': 'WhatsApp',
    'push': 'ແຈ້ງເຕືອນແອັບ (Push)',
    'in_app': 'ແຈ້ງເຕືອນໃນລະບົບ (In-App)',
  }
  return types[key] || key || 'ແຈ້ງເຕືອນ'
}

/**
 * แปลง workflow nodes เป็น steps ที่ citizen เข้าใจได้
 * ซ่อน technical nodes เช่น HTTP_REQUEST, SCRIPT, IF_ELSE
 */
export function convertWorkflowToCitizenSteps(nodes: any[], edges: any[]): CitizenStep[] {
  const steps: CitizenStep[] = []
  let order = 1

  // Sort nodes by execution order (topological sort)
  const sortedNodes = topologicalSortNodes(nodes, edges)

  // Filter and convert nodes to citizen-friendly steps
  sortedNodes.forEach(node => {
    const method = node.data?.method || node.type
    const citizenStep = convertNodeToCitizenStep(node, method, order)

    if (citizenStep) {
      steps.push(citizenStep)
      order++
    }
  })

  return steps
}

/**
 * แปลง node เป็น citizen step
 * Return null ถ้าเป็น technical node ที่ไม่ต้องแสดง
 */
function convertNodeToCitizenStep(node: any, method: string, order: number): CitizenStep | null {
  const data = node.data || {}

  switch (method) {
    case 'NODE_START':
      return {
        id: node.id,
        order,
        title: data.label || 'ຍື່ນຄຳຮ້ອງ',
        description: data.description || 'ກະລຸນາກອກຂໍ້ມູນ ແລະ ຄຽມເອກະສານທີ່ຕ້ອງການ',
        icon: <FileText size={24} className="text-primary" />,
        type: 'start',
        documents: data.sampleDocuments?.map((d: any) => d.name) || [],
        isRequired: true,
        nodeData: {
          method: 'NODE_START',
          label: data.label,
          inputFields: data.inputFields || [],
          sampleDocuments: data.sampleDocuments || [],
          conditions: data.conditions || [],
          formLayout: data.formLayout,
          rawData: data
        }
      }

    case 'NODE_FORM':
      return {
        id: node.id,
        order,
        title: data.label || 'ກອກແບບຟອມ',
        description: data.description || 'ກອກຂໍ້ມູນເພີ່ມເຕີມຕາມທີ່ກຳນົດ',
        icon: <FileText size={24} className="text-blue-500" />,
        type: 'document',
        isRequired: true,
        nodeData: {
          method: 'NODE_FORM',
          label: data.label,
          inputFields: data.inputFields || [],
          formLayout: data.formLayout,
          rawData: data
        }
      }

    case 'NODE_RESPONSIBLE':
      return {
        id: node.id,
        order,
        title: data.label || 'ເຈົ້າໜ້າທີ່ກວດສອບ',
        description: data.description || 'ເຈົ້າໜ້າທີ່ຈະກວດສອບຂໍ້ມູນ ແລະ ເອກະສານຂອງທ່ານ',
        icon: <User size={24} className="text-cyan-500" />,
        type: 'officer',
        responsible: data.responsible || data.responsePerson,
        estimatedTime: data.estimatedTime || '1-3 ວັນ',
        nodeData: {
          method: 'NODE_RESPONSIBLE',
          label: data.label,
          ministry: data.ministry,
          ministryLabel: getMinistryLabel(data.ministry),
          department: data.department,
          departmentLabel: getDepartmentLabel(data.department),
          responsibleRole: data.responsible,
          responsibleRoleLabel: getResponsibleRoleLabel(data.responsible),
          taskManager: data.taskManager || [],
          taskManagerLabels: (data.taskManager || []).map((t: string) => getTaskLabel(t)),
          responsibilityDetails: data.responsibilityDetails,
          rawData: data
        }
      }

    case 'NODE_FEE':
      return {
        id: node.id,
        order,
        title: data.label || 'ຊຳລະຄ່າທຳນຽມ',
        description: data.description || 'ກະລຸນາຊຳລະຄ່າທຳນຽມຕາມທີ່ກຳນົດ',
        icon: <CreditCard size={24} className="text-pink-500" />,
        type: 'payment',
        fee: data.feeAmount || 0,
        isRequired: true,
        nodeData: {
          method: 'NODE_FEE',
          label: data.label,
          feeType: data.feeType,
          feeAmount: data.feeAmount || 0,
          currency: data.currency || 'LAK',
          feeDescription: data.feeDescription || data.description,
          paymentMethods: data.paymentMethods || ['ເງິນສົດ', 'ໂອນຜ່ານທະນາຄານ', 'Mobile Banking'],
          rawData: data
        }
      }

    case 'NODE_NOTIFICATION':
      return {
        id: node.id,
        order,
        title: data.notificationTitle || data.label || 'ແຈ້ງເຕືອນ',
        description: data.notificationDescription || 'ທ່ານຈະໄດ້ຮັບການແຈ້ງເຕືອນສະຖານະ',
        icon: <Bell size={24} className="text-yellow-500" />,
        type: 'notification',
        nodeData: {
          method: 'NODE_NOTIFICATION',
          label: data.label,
          notificationType: data.notificationType,
          notificationTitle: data.notificationTitle,
          notificationDescription: data.notificationDescription,
          notificationRecipients: data.notificationRecipients || [],
          rawData: data
        }
      }

    case 'NODE_DOCUMENT':
      return {
        id: node.id,
        order,
        title: data.label || 'ກຽມເອກະສານ',
        description: data.description || 'ເອກະສານທີ່ຕ້ອງຄຽມ',
        icon: <FileCheck size={24} className="text-indigo-500" />,
        type: 'document',
        documents: data.documents?.map((d: any) => d.name) || [],
        nodeData: {
          method: 'NODE_DOCUMENT',
          label: data.label,
          sampleDocuments: data.documents || [],
          documentType: data.documentType,
          documentsCount: data.documents?.length || 0,
          rawData: data
        }
      }

    case 'NODE_TIMELINE':
      return {
        id: node.id,
        order,
        title: data.label || 'ໄລຍະເວລາດຳເນີນການ',
        description: data.description || 'ລະບົບຈະດຳເນີນການຕາມໄລຍະເວລາທີ່ກຳນົດ',
        icon: <Clock size={24} className="text-teal-500" />,
        type: 'timeline',
        estimatedTime: data.timeline || data.deadline,
        nodeData: {
          method: 'NODE_TIMELINE',
          label: data.label,
          timeline: data.timeline,
          deadline: data.deadline,
          timelineDescription: data.description,
          rawData: data
        }
      }

    case 'NODE_END':
      return {
        id: node.id,
        order,
        title: data.label || 'ສຳເລັດ',
        description: data.description || 'ຮັບເອກະສານ ຫຼື ຜົນການດຳເນີນການ',
        icon: <Flag size={24} className="text-green-500" />,
        type: 'end',
        nodeData: {
          method: 'NODE_END',
          label: data.label,
          templateData: data.templateData,
          documentMappings: data.documentMappings || [],
          outputDescription: data.outputDescription || data.description,
          outputDocuments: data.outputDocuments || [],
          rawData: data
        }
      }

    // Technical nodes - ซ่อนจาก citizen
    case 'NODE_HTTP_REQUEST':
    case 'NODE_SCRIPT':
    case 'NODE_IF_ELSE':
    case 'NODE_TRIGGER':
    case 'NODE_AGENT':
      return null

    default:
      return null
  }
}

// Topological sort for nodes
function topologicalSortNodes(nodes: any[], edges: any[]): any[] {
  const graph = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  nodes.forEach(node => {
    graph.set(node.id, [])
    inDegree.set(node.id, 0)
  })

  edges.forEach(edge => {
    const sourceConnections = graph.get(edge.source) || []
    sourceConnections.push(edge.target)
    graph.set(edge.source, sourceConnections)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })

  const queue: string[] = []
  const result: any[] = []

  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId)
  })

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const currentNode = nodes.find(n => n.id === currentId)
    if (currentNode) result.push(currentNode)

    const neighbors = graph.get(currentId) || []
    neighbors.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 1) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) queue.push(neighbor)
    })
  }

  return result
}

// ============================================================================
// MAIN COMPONENT - Citizen Workflow Preview
// ============================================================================

export default function CitizenWorkflowPreview({
  serviceName,
  steps,
  totalEstimatedDays,
  totalFee,
  className = '',
  variant = 'vertical'
}: CitizenWorkflowPreviewProps) {


  // Refs for measuring detail card heights
  const detailRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [cardHeights, setCardHeights] = useState<{ [key: string]: number }>({})

  // Measure card heights after render
  useEffect(() => {
    const measureHeights = () => {
      const heights: { [key: string]: number } = {}
      steps.forEach(step => {
        const ref = detailRefs.current[step.id]
        if (ref) {
          heights[step.id] = ref.offsetHeight
        }
      })
      setCardHeights(heights)
    }

    // Delay measurement to ensure DOM is ready
    const timer = setTimeout(measureHeights, 100)
    return () => clearTimeout(timer)
  }, [steps])

  // คำนวณค່าธรรมเนียมรวม
  const calculatedTotalFee = useMemo(() => {
    if (totalFee !== undefined) return totalFee
    return steps.reduce((sum, step) => sum + (step.fee || 0), 0)
  }, [steps, totalFee])

  // นับจำนวนขั้นตอน
  const totalSteps = steps.length

  console.log("LOGS_steps: ", steps)

  if (variant === 'compact') {
    return <CompactPreview steps={steps} serviceName={serviceName} />
  }

  if (variant === 'horizontal') {
    return <HorizontalPreview steps={steps} serviceName={serviceName} />
  }

  return (
    <Card className={`${className} flex flex-col p-4`} shadow='none'>
      {/* Summary */}
      <div className="flex gap-4 mb-6 flex-wrap flex-shrink-0">
        <Chip color="primary" variant="flat" size="sm">
          {totalSteps} ຂັ້ນຕອນ
        </Chip>
        {totalEstimatedDays && (
          <Chip color="warning" variant="flat" size="sm" startContent={<Clock size={14} />}>
            ປະມານ {totalEstimatedDays} ວັນ
          </Chip>
        )}
        {calculatedTotalFee > 0 && (
          <Chip color="success" variant="flat" size="sm" startContent={<CreditCard size={14} />}>
            ຄ່າທຳນຽມ: {calculatedTotalFee.toLocaleString()} ກີບ
          </Chip>
        )}
      </div>

      {/* Two Column Layout - Synchronized */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* First Column - Timeline with Nodes */}
        <div className="lg:col-span-6 xl:col-span-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Clock size={16} />
            ຂັ້ນຕອນ
          </h3>
          <div className="relative">
            {steps.map((step, index) => {
              // Get height of corresponding detail card
              const cardHeight = cardHeights[step.id] || 150
              const isLastStep = index === steps.length - 1

              return (
                <div
                  key={step.id}
                  className="relative"
                  style={{ minHeight: isLastStep ? 'auto' : cardHeight + 16 }}
                >
                  {/* Card Background with Icon */}
                  <div
                    className={`
                      relative p-3 rounded-xl shadow-sm border
                      ${step.type === 'start' ? 'bg-primary/5 border-primary/20' : ''}
                      ${step.type === 'end' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''}
                      ${step.type === 'payment' ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800' : ''}
                      ${step.type === 'officer' ? 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800' : ''}
                      ${step.type === 'document' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''}
                      ${step.type === 'notification' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' : ''}
                      ${step.type === 'timeline' ? 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Node Icon */}
                      <div className={`
                        relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0
                        ${step.type === 'start' ? 'bg-primary text-white' : ''}
                        ${step.type === 'end' ? 'bg-green-500 text-white' : ''}
                        ${step.type === 'payment' ? 'bg-pink-500 text-white' : ''}
                        ${step.type === 'officer' ? 'bg-cyan-500 text-white' : ''}
                        ${step.type === 'document' ? 'bg-blue-500 text-white' : ''}
                        ${step.type === 'notification' ? 'bg-yellow-500 text-white' : ''}
                        ${step.type === 'timeline' ? 'bg-teal-500 text-white' : ''}
                      `}>
                        {React.cloneElement(step.icon as React.ReactElement, {
                          size: 20,
                          className: 'text-white'
                        })}
                        {/* Step Number Badge */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                          {step.order}
                        </div>
                      </div>

                      {/* Node Title & Description */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line - From bottom of card to next card */}
                  {!isLastStep && (
                    <div className="flex justify-start pl-8">
                      <div
                        className="w-0.5 flex-1"
                        style={{
                          minHeight: Math.max(cardHeight - 80, 40),
                          maxWidth: 2,
                          background: `linear-gradient(to bottom, ${getStepColor(step.type)}, ${getStepColor(steps[index + 1]?.type || 'default')})`
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Second Column - Node Details (Always Visible) */}
        <div className="lg:col-span-6 xl:col-span-9">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 hidden lg:flex items-center gap-2">
            <FileText size={16} className="inline mr-2" />
            ລາຍລະອຽດແຕ່ລະຂັ້ນຕອນ
          </h3>
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                ref={(el) => { detailRefs.current[step.id] = el }}
              >
                <Card
                  className="overflow-hidden"
                  shadow="sm"
                >
                  {/* Detail Header */}
                  {/* <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${step.type === 'start' ? 'bg-primary/20 text-primary' : ''}
                        ${step.type === 'end' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : ''}
                        ${step.type === 'payment' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : ''}
                        ${step.type === 'officer' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' : ''}
                        ${step.type === 'document' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}
                        ${step.type === 'notification' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : ''}
                        ${step.type === 'timeline' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' : ''}
                      `}>
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                          ຂັ້ນຕອນທີ {step.order}: {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {step.description}
                        </p>
                      </div>
                      {step.isRequired && (
                        <Chip size="sm" color="danger" variant="flat" className="flex-shrink-0">
                          ຈຳເປັນ
                        </Chip>
                      )}
                    </div>
                  </div> */}

                  {/* Detail Content */}
                  <div className="p-4">
                    <StepDetailsGrid step={step} />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Helper function to get step color
function getStepColor(type: string): string {
  switch (type) {
    case 'start': return '#006FEE'
    case 'end': return '#22c55e'
    case 'payment': return '#ec4899'
    case 'officer': return '#06b6d4'
    case 'document': return '#3b82f6'
    case 'notification': return '#eab308'
    case 'timeline': return '#14b8a6'
    default: return '#6b7280'
  }
}

// ============================================================================
// RENDER PREVIEW FIELD - ສະແດງ field ແບບ form preview
// ============================================================================

function renderPreviewField(field: any) {
  const baseInputProps = {
    isDisabled: false,
    variant: "flat" as const,
    labelPlacement: "outside" as const,
    size: "lg" as const,
    classNames: {
      label: "text-xs font-medium text-gray-600 dark:text-gray-400",
    }
  }

  // Text, Email, Tel, URL, Password
  if (['text', 'email', 'tel', 'url', 'password'].includes(field.type)) {
    const iconMap: Record<string, React.ReactNode> = {
      text: <Type size={14} className="text-gray-400" />,
      email: <Mail size={14} className="text-gray-400" />,
      tel: <Phone size={14} className="text-gray-400" />,
      url: <Globe size={14} className="text-gray-400" />,
      password: <Lock size={14} className="text-gray-400" />,
    }
    return (
      <Input
        type={field.type}
        label={
          <span className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
        }
        placeholder={field.placeholder || `ປ້ອນ ${field.label}...`}
        startContent={iconMap[field.type]}
        {...baseInputProps}
      />
    )
  }

  // Number
  if (field.type === 'number') {
    return (
      <Input
        type="number"
        label={
          <span className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
        }
        placeholder={field.placeholder || '0'}
        startContent={<Hash size={14} className="text-gray-400" />}
        {...baseInputProps}
      />
    )
  }

  // Textarea
  if (field.type === 'textarea') {
    return (
      <Textarea
        label={
          <span className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
        }
        placeholder={field.placeholder || `ປ້ອນ ${field.label}...`}
        minRows={3}
        {...baseInputProps}
      />
    )
  }

  // Date
  if (field.type === 'date') {
    return (
      <DatePicker
        label={
          <span className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
        }
        isDisabled
        variant="bordered"
        labelPlacement="outside"
        showMonthAndYearPickers
        granularity="day"
      />
    )
  }

  // Time
  if (field.type === 'time') {
    return (
      <TimeInput
        label={
          <span className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
        }
        isDisabled
        variant="bordered"
        labelPlacement="outside"
        hourCycle={24}
      />
    )
  }

  // DateTime
  if (field.type === 'datetime-local') {
    return (
      <DatePicker
        label={
          <span className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
        }
        isDisabled
        variant="bordered"
        labelPlacement="outside"
        showMonthAndYearPickers
        granularity="minute"
        hideTimeZone
      />
    )
  }

  // Select
  if (field.type === 'select') {
    return (
      <Select
        label={
          <span className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
        }
        placeholder="-- ເລືອກ --"
        {...baseInputProps}
      >
        {(field.options || []).map((option: string, optIndex: number) => (
          <SelectItem key={optIndex} textValue={option}>
            {option}
          </SelectItem>
        ))}
      </Select>
    )
  }

  // Radio
  if (field.type === 'radio') {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <RadioGroup
          isDisabled
          orientation="horizontal"
          className="gap-2"
          size="sm"
        >
          {(field.options || []).map((option: string, optIndex: number) => (
            <Radio key={optIndex} value={option} size="sm">
              <span className="text-xs">{option}</span>
            </Radio>
          ))}
        </RadioGroup>
      </div>
    )
  }

  // Checkbox
  if (field.type === 'checkbox') {
    return (
      <Checkbox size="sm" isDisabled>
        <span className="text-xs">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </Checkbox>
    )
  }

  // File Upload
  if (field.type === 'file') {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center cursor-not-allowed opacity-60">
          <Upload size={20} className="mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-500">
            ຄລິກເພື່ອອັບໂຫຼດ ຫຼື ລາກໄຟລ໌ມາວາງ
          </p>
          {field.placeholder && (
            <p className="text-xs text-gray-400 mt-1">{field.placeholder}</p>
          )}
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <Input
      label={field.label}
      placeholder={field.placeholder || ''}
      {...baseInputProps}
    />
  )
}

// ============================================================================
// STEP DETAILS GRID COMPONENT - ລາຍລະອຽດແບບ Grid Layout
// ============================================================================

function StepDetailsGrid({ step }: { step: CitizenStep }) {
  return (
    <div className="space-y-6 p-3">
      {/* Quick Stats Row */}
      {(step.estimatedTime || (step.fee !== undefined && step.fee > 0) || step.responsible || step.nodeData?.feeType) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {step.estimatedTime && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <Clock size={20} className="mx-auto text-teal-500 mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">ເວລາ</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{step.estimatedTime}</p>
            </div>
          )}
          {step.fee !== undefined && step.fee > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <CreditCard size={20} className="mx-auto text-pink-500 mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">ຄ່າທຳນຽມ</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{step.fee.toLocaleString()} ກີບ</p>
            </div>
          )}
          {step.responsible && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <User size={20} className="mx-auto text-cyan-500 mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">ຜູ້ຮັບຜິດຊອບ</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{step.responsible}</p>
            </div>
          )}
          {step.nodeData?.feeType && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <FileCheck size={20} className="mx-auto text-indigo-500 mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">ປະເພດ</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{step.nodeData.feeType}</p>
            </div>
          )}
        </div>
      )}

      {/* Input Fields Form Preview */}
      {step.nodeData?.inputFields && step.nodeData.inputFields.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Type size={16} />
            ຂໍ້ມູນທີ່ຕ້ອງກອກ ({step.nodeData.inputFields.length} ລາຍການ)
          </h4>
          <div className=" bg-white dark:bg-gray-800 rounded-xl ">
            {/* Check if formLayout with groups exists */}
            {step.nodeData?.formLayout?.groups && step.nodeData.formLayout.groups.length > 0 ? (
              <div className="space-y-6">
                {/* Render Groups */}
                {step.nodeData.formLayout.groups.map((group: any) => {
                  const columns = step.nodeData?.formLayout?.columns || 2
                  return (
                    <div key={group.id} className="space-y-4">
                      {/* Group Header */}
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                        <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {group.name}
                        </h5>
                        {group.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                        )}
                      </div>
                      {/* Group Fields Grid */}
                      <div
                        className="grid gap-4"
                        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                      >
                        {group.items
                          ?.sort((a: any, b: any) => a.row - b.row || a.column - b.column)
                          .map((item: any) => {
                            const field = step.nodeData?.inputFields?.find((f: any) => f.id === item.fieldId)
                            if (!field) return null
                            const colSpan = Math.min(item.colSpan || 1, columns)
                            return (
                              <div
                                key={item.id}
                                style={{ gridColumn: `span ${colSpan}` }}
                              >
                                {renderPreviewField(field)}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )
                })}

                {/* Render Ungrouped Items */}
                {step.nodeData.formLayout.ungroupedItems && step.nodeData.formLayout.ungroupedItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        ອື່ນໆ
                      </h5>
                    </div>
                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${step.nodeData.formLayout.columns || 2}, 1fr)` }}
                    >
                      {step.nodeData.formLayout.ungroupedItems
                        .sort((a: any, b: any) => a.row - b.row || a.column - b.column)
                        .map((item: any) => {
                          const field = step.nodeData?.inputFields?.find((f: any) => f.id === item.fieldId)
                          if (!field) return null
                          const colSpan = Math.min(item.colSpan || 1, step.nodeData?.formLayout?.columns || 2)
                          return (
                            <div
                              key={item.id}
                              style={{ gridColumn: `span ${colSpan}` }}
                            >
                              {renderPreviewField(field)}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback: Simple Grid Layout without formLayout */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.nodeData.inputFields.map((field: any, i: number) => (
                  <div key={i} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    {renderPreviewField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Divider />

      {/* ========== NODE_START DETAILS ========== */}
      {step.nodeData?.method === 'NODE_START' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            ຂໍ້ມູນເລີ່ມຕົ້ນຄຳຮ້ອງ
          </h4>
          
          {/* Start Node Summary */}
          <div className="p-6 bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/20 rounded-xl border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
                <FileText size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-primary dark:text-primary-400">ຂັ້ນຕອນເລີ່ມຕົ້ນ</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            {step.nodeData?.inputFields && step.nodeData.inputFields.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                    <Type size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 dark:text-blue-400">ຂໍ້ມູນທີ່ຕ້ອງກອກ</p>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                      {step.nodeData.inputFields.length} ລາຍການ
                    </p>
                  </div>
                </div>
              </div>
            )}
            {step.nodeData?.sampleDocuments && step.nodeData.sampleDocuments.length > 0 && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                    <FileCheck size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">ເອກະສານຕົວຢ່າງ</p>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                      {step.nodeData.sampleDocuments.length} ລາຍການ
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sample Documents List */}
          {step.nodeData?.sampleDocuments && step.nodeData.sampleDocuments.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FileCheck size={16} />
                ເອກະສານຕົວຢ່າງທີ່ສາມາດດາວໂຫຼດ
              </h5>
              <div className="space-y-2">
                {step.nodeData.sampleDocuments.map((doc: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.isPrivate ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                      {doc.isPrivate ? <Lock size={16} className="text-red-500" /> : <FileText size={16} className="text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{doc.name}</p>
                      {doc.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                      )}
                      {doc.isPrivate && (
                        <Chip size="sm" variant="flat" color="danger" className="mt-1">
                          ເອກະສານສ່ວນຕົວ
                        </Chip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== NODE_FORM DETAILS ========== */}
      {step.nodeData?.method === 'NODE_FORM' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            ລາຍລະອຽດແບບຟອມ
          </h4>
          
          {/* Form Summary */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                <FileText size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-600 dark:text-blue-400">ແບບຟອມ</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {step.title}
                </p>
                {step.nodeData?.inputFields && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ມີ {step.nodeData.inputFields.length} ຊ່ອງຂໍ້ມູນທີ່ຕ້ອງກອກ
                  </p>
                )}
              </div>
              {step.isRequired && (
                <Chip size="sm" variant="flat" color="danger">
                  ຈຳເປັນ
                </Chip>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== NODE_NOTIFICATION DETAILS ========== */}
      {step.nodeData?.method === 'NODE_NOTIFICATION' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Bell size={16} className="text-yellow-500" />
            ລາຍລະອຽດການແຈ້ງເຕືອນ
          </h4>
          
          {/* Notification Type Card */}
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                <Bell size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">ປະເພດການແຈ້ງເຕືອນ</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {getNotificationTypeLabel(step.nodeData.notificationType || '')}
                </p>
              </div>
              {step.nodeData.notificationType && (
                <Chip size="sm" variant="flat" color="warning">
                  {step.nodeData.notificationType}
                </Chip>
              )}
            </div>
          </div>

          {/* Notification Title & Description */}
          {(step.nodeData?.notificationTitle || step.nodeData?.notificationDescription) && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              {step.nodeData.notificationTitle && (
                <div className="mb-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">ຫົວຂໍ້ແຈ້ງເຕືອນ</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{step.nodeData.notificationTitle}</p>
                </div>
              )}
              {step.nodeData.notificationDescription && (
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">ເນື້ອຫາແຈ້ງເຕືອນ</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{step.nodeData.notificationDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* Recipients */}
          {step.nodeData?.notificationRecipients && step.nodeData.notificationRecipients.length > 0 && (
            <div className="space-y-3">
              {/* Customer Recipients */}
              {step.nodeData.notificationRecipients.filter((r: any) => r.type === 'customer').length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <User size={16} />
                    ຜູ້ຮັບແຈ້ງເຕືອນ - ລູກຄ້າ
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {step.nodeData.notificationRecipients
                      .filter((r: any) => r.type === 'customer')
                      .map((recipient: any, i: number) => (
                        <Chip key={i} size="sm" variant="flat" color="primary" startContent={<User size={12} />}>
                          {recipient.label || recipient}
                        </Chip>
                      ))}
                  </div>
                </div>
              )}

              {/* Responsible Recipients */}
              {step.nodeData.notificationRecipients.filter((r: any) => r.type === 'responsible').length > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h5 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <Users size={16} />
                    ຜູ້ຮັບແຈ້ງເຕືອນ - ຜູ້ຮັບຜິດຊອບ
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {step.nodeData.notificationRecipients
                      .filter((r: any) => r.type === 'responsible')
                      .map((recipient: any, i: number) => (
                        <Chip key={i} size="sm" variant="flat" color="secondary" startContent={<User size={12} />}>
                          {recipient.label || recipient}
                        </Chip>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== NODE_DOCUMENT DETAILS ========== */}
      {step.nodeData?.method === 'NODE_DOCUMENT' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileCheck size={16} className="text-indigo-500" />
            ລາຍລະອຽດເອກະສານ
          </h4>
          
          {/* Document Summary */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                <FileCheck size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-indigo-600 dark:text-indigo-400">ເອກະສານທີ່ຕ້ອງກຽມ</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {step.nodeData.documentsCount || step.documents?.length || 0} ລາຍການ
                </p>
                {step.nodeData.documentType && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ປະເພດ: {step.nodeData.documentType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Document List */}
          {step.nodeData?.sampleDocuments && step.nodeData.sampleDocuments.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FileText size={16} />
                ລາຍການເອກະສານ
              </h5>
              <div className="space-y-2">
                {step.nodeData.sampleDocuments.map((doc: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{doc.name || doc}</p>
                      {doc.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                      )}
                    </div>
                    {doc.type && (
                      <Chip size="sm" variant="bordered" color="secondary">
                        {doc.type}
                      </Chip>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== NODE_TIMELINE DETAILS ========== */}
      {step.nodeData?.method === 'NODE_TIMELINE' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock size={16} className="text-teal-500" />
            ລາຍລະອຽດໄລຍະເວລາ
          </h4>
          
          {/* Timeline Summary */}
          <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-500 text-white flex items-center justify-center flex-shrink-0">
                <Clock size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-teal-600 dark:text-teal-400">ໄລຍະເວລາດຳເນີນການ</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {step.nodeData.timeline || step.nodeData.deadline || step.estimatedTime || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {step.nodeData.timeline && (
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-teal-600 dark:text-teal-400">ໄລຍະເວລາ</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {step.nodeData.timeline}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {step.nodeData.deadline && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-orange-600 dark:text-orange-400">ກຳນົດເວລາ (Deadline)</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {step.nodeData.deadline}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Description */}
          {step.nodeData?.timelineDescription && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ລາຍລະອຽດ
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step.nodeData.timelineDescription}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========== NODE_RESPONSIBLE DETAILS ========== */}
      {step.nodeData?.method === 'NODE_RESPONSIBLE' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users size={16} className="text-cyan-500" />
            ລາຍລະອຽດເຈົ້າໜ້າທີ່ຮັບຜິດຊອບ
          </h4>
          
          {/* Organization Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ministry */}
            {step.nodeData?.ministry && (
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cyan-600 dark:text-cyan-400">ກະຊວງ</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                      {step.nodeData.ministryLabel || step.nodeData.ministry}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Department */}
            {step.nodeData?.department && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 dark:text-blue-400">ພະແນກ / ກົມ</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                      {step.nodeData.departmentLabel || step.nodeData.department}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Responsible Role */}
            {step.nodeData?.responsibleRole && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">ບົດບາດຜູ້ຮັບຜິດຊອບ</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                      {step.nodeData.responsibleRoleLabel || step.nodeData.responsibleRole}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            {step.estimatedTime && (
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-teal-600 dark:text-teal-400">ໄລຍະເວລາດຳເນີນການ</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {step.estimatedTime}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tasks */}
          {step.nodeData?.taskManager && step.nodeData.taskManager.length > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <h5 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                <ClipboardList size={16} />
                ໜ້າວຽກທີ່ຕ້ອງດຳເນີນການ
              </h5>
              <div className="flex flex-wrap gap-2">
                {step.nodeData.taskManagerLabels?.map((task: string, i: number) => (
                  <Chip key={i} size="sm" variant="flat" color="secondary" startContent={<CheckSquare size={12} />}>
                    {task}
                  </Chip>
                )) || step.nodeData.taskManager.map((task: string, i: number) => (
                  <Chip key={i} size="sm" variant="flat" color="secondary" startContent={<CheckSquare size={12} />}>
                    {task}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Responsibility Details */}
          {step.nodeData?.responsibilityDetails && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                ລາຍລະອຽດເພີ່ມເຕີມ
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {step.nodeData.responsibilityDetails}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========== NODE_FEE DETAILS ========== */}
      {step.nodeData?.method === 'NODE_FEE' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Banknote size={16} className="text-pink-500" />
            ລາຍລະອຽດຄ່າທຳນຽມ
          </h4>
          
          {/* Fee Amount Card */}
          <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-pink-500 text-white flex items-center justify-center flex-shrink-0">
                  <Receipt size={28} />
                </div>
                <div>
                  <p className="text-sm text-pink-600 dark:text-pink-400">ຈຳນວນເງິນທີ່ຕ້ອງຊຳລະ</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {(step.nodeData.feeAmount || step.fee || 0).toLocaleString()} <span className="text-lg">{step.nodeData.currency || 'ກີບ'}</span>
                  </p>
                </div>
              </div>
              {step.nodeData.feeType && (
                <Chip size="sm" variant="flat" color="danger">
                  {step.nodeData.feeType}
                </Chip>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          {step.nodeData?.paymentMethods && step.nodeData.paymentMethods.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h5 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                <CreditCard size={16} />
                ວິທີການຊຳລະເງິນ
              </h5>
              <div className="flex flex-wrap gap-2">
                {step.nodeData.paymentMethods.map((method: string, i: number) => (
                  <Chip key={i} size="sm" variant="bordered" color="success">
                    {method}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Fee Description */}
          {step.nodeData?.feeDescription && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ລາຍລະອຽດ
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step.nodeData.feeDescription}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========== NODE_END DETAILS ========== */}
      {step.nodeData?.method === 'NODE_END' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileOutput size={16} className="text-green-500" />
            ຜົນໄດ້ຮັບຈາກການດຳເນີນການ
          </h4>
          
          {/* Output Summary */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <Flag size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-600 dark:text-green-400">ສະຖານະ</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  ດຳເນີນການສຳເລັດ
                </p>
                {step.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Template Data */}
          {step.nodeData?.templateData && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-emerald-700 dark:text-emerald-300">
                    ເອກະສານຜົນໄດ້ຮັບ
                  </h5>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    ມີ Template ເອກະສານພ້ອມສຳລັບດາວໂຫຼດ
                  </p>
                </div>
                <Chip size="sm" variant="flat" color="success">
                  ພ້ອມໃຊ້ງານ
                </Chip>
              </div>
            </div>
          )}

          {/* Document Mappings */}
          {step.nodeData?.documentMappings && step.nodeData.documentMappings.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                <Link size={16} />
                ເອກະສານແນບທີ່ຈະໄດ້ຮັບ ({step.nodeData.documentMappings.length} ລາຍການ)
              </h5>
              <div className="space-y-2">
                {step.nodeData.documentMappings.map((doc: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <FileCheck size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {doc.name || doc.label || `ເອກະສານ ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Description */}
          {step.nodeData?.outputDescription && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ລາຍລະອຽດຜົນໄດ້ຮັບ
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step.nodeData.outputDescription}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Documents Grid */}
      {step.documents && step.documents.length > 0 && (
        <div >
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            ເອກະສານທີ່ຕ້ອງຂຽມ ({step.documents.length} ລາຍການ)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {step.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-primary" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions */}
      {step.nodeData?.conditions && step.nodeData.conditions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            ⚙️ ເງື່ອນໄຂ
          </h4>
          <div className="space-y-2">
            {step.nodeData.conditions.map((cond: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 font-mono text-sm"
              >
                <span className="text-purple-600 dark:text-purple-400">{cond.field}</span>
                {' '}<span className="text-gray-500">{cond.operator}</span>{' '}
                <span className="text-green-600 dark:text-green-400">"{cond.value}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Recipients */}
      {step.nodeData?.notificationRecipients && step.nodeData.notificationRecipients.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Bell size={16} className="text-yellow-500" />
            ຜູ້ຮັບການແຈ້ງເຕືອນ
          </h4>
          <div className="flex flex-wrap gap-2">
            {step.nodeData.notificationRecipients.map((recipient: string, i: number) => (
              <Chip key={i} size="sm" variant="flat" color="warning" startContent={<User size={12} />}>
                {recipient}
              </Chip>
            ))}
          </div>
        </div>
      )}
 
      {/* Node Type - Show only for non-specific nodes that don't have their own detail section */}
      {step.nodeData?.method && !['NODE_START', 'NODE_FORM', 'NODE_RESPONSIBLE', 'NODE_FEE', 'NODE_NOTIFICATION', 'NODE_DOCUMENT', 'NODE_TIMELINE', 'NODE_END'].includes(step.nodeData.method) && (
        <div className="pt-3">
          <Chip size="sm" variant="dot" color="default" className="text-xs">
            Node Type: {step.nodeData.method}
          </Chip>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPACT VARIANT - แบบกระชับ สำหรับแสดงใน Card เล็กๆ
// ============================================================================

function CompactPreview({ steps, serviceName }: { steps: CitizenStep[]; serviceName: string }) {
  return (
    <div className="p-4 max-h-64 overflow-y-auto">
      <h3 className="font-semibold mb-3 sticky top-0 bg-white dark:bg-gray-800 z-10">{serviceName}</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center min-w-fit">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs
                ${step.type === 'start' ? 'bg-primary text-white' : ''}
                ${step.type === 'end' ? 'bg-green-500 text-white' : ''}
                ${!['start', 'end'].includes(step.type) ? 'bg-gray-200 dark:bg-gray-700' : ''}
              `}>
                {step.order}
              </div>
              <span className="text-xs text-gray-500 mt-1 max-w-16 text-center truncate">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ArrowDown size={16} className="text-gray-400 rotate-[-90deg] flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// HORIZONTAL VARIANT - แบบแนวนอน
// ============================================================================

function HorizontalPreview({ steps, serviceName }: { steps: CitizenStep[]; serviceName: string }) {
  const progress = 0 // Can be dynamic based on current step

  return (
    <Card className="p-6 max-h-96 overflow-y-auto">
      <h3 className="font-semibold mb-4 sticky top-0 bg-white dark:bg-gray-800 z-10">{serviceName}</h3>

      <Progress
        value={progress}
        className="mb-4"
        color="primary"
        size="sm"
      />

      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center mb-2
              ${step.type === 'start' ? 'bg-primary/10' : ''}
              ${step.type === 'end' ? 'bg-green-100' : ''}
              ${!['start', 'end'].includes(step.type) ? 'bg-gray-100' : ''}
            `}>
              {step.icon}
            </div>
            <span className="text-xs text-center text-gray-600 max-w-20">
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 -z-10" />
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ============================================================================
// EXPORT HELPER FOR COPY TO CITIZEN WEB
// ============================================================================

/**
 * สร้าง JSON สำหรับ copy ไปใช้ที่หน้า Citizen
 */
export function exportWorkflowForCitizen(
  serviceName: string,
  nodes: any[],
  edges: any[]
): {
  serviceName: string
  steps: CitizenStep[]
  totalSteps: number
  exportedAt: string
} {
  const steps = convertWorkflowToCitizenSteps(nodes, edges)

  return {
    serviceName,
    steps,
    totalSteps: steps.length,
    exportedAt: new Date().toISOString()
  }
}
