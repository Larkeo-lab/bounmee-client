import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    minHeight?: string
    className?: string
    simple?: boolean
}


// Custom toolbar for news editing
const NEWS_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
    ]
}

const NEWS_FORMATS = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image', 'video'
]

// Simple toolbar for basic descriptions
const SIMPLE_MODULES = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ]
}

const SIMPLE_FORMATS = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
]

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'ປ້ອນເນື້ອຫາ...',
    minHeight = '400px',
    className = '',
    simple = false
}: RichTextEditorProps) {
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={simple ? SIMPLE_MODULES : NEWS_MODULES}
            formats={simple ? SIMPLE_FORMATS : NEWS_FORMATS}
            placeholder={placeholder}
            className={className}
            style={{
                backgroundColor: 'white',
                minHeight: minHeight,
            }}
        />
    )
}
