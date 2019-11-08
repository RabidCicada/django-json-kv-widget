import json
import traceback
from itertools import islice

from django.forms import Widget,MultiWidget,CharField,MultiValueField,TextInput
from django.utils.safestring import mark_safe
from django.forms.utils import flatatt
from django.template.loader import get_template

class JsonKVWidget(TextInput):
    template_name = 'json_pairs_widget/json_input_widget.html'
    class Media:
        css = {
            'all': ('js/json_kv_widget/jstree/themes/default/style.css',)
        }
        js = ('js/json_kv_widget/jstree/jstree.js','js/json_kv_widget/json_kv_widget.js')

    def __init__(self, attrs=None, *args, **kwargs):
        if attrs is not None:
            attrs = attrs.copy()
        super().__init__(attrs, *args, **kwargs)

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        return context
