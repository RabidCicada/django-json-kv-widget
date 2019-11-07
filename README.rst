===================
Json KV widget
===================

A Django widget for rendering a nice Key-Value editing GUI that supports folders
and uses json as it's backing data format.

Please note Object (with a capital 'O') means the literal javascript type 'Object'

The widget expects the json to largely be an array of key:val scalars and if there are groups/folders
of related key:vals then it expects them to be organised as 'folderkey:[{key:val},...]'s
The reason is that arrays are orderable while Objects are not.  We want to let the
user order the key:vals as desired.

The root data structure should be an array.

Keys with single element Objects are a single Key:val.

Keys with arrays as their value will be folders and empty folders are allowed.

We make attempts to ingest keys whose values are multi element Objects such as
'folderkey:{key:val,...}'s Objects but they will be converted to our desired format.
In this case, keys with multi element Objects are also folders.

Example:
'[{"key":"value"},{"folder1":[{"key1":"value1"},{"key2":"value2"}]},{"folder2":[]}]'

Valid but will be converted:
'[{"key":"value"},{"folder1":{"key1":"value1","key2":"value2"}},{"folder2":[]}]'


In order to use this Widget:

- The Django Model Field should be a text based one or JSON field.
- The Django Model Field should be given a default value of an empty array '[]'
- Use the standard Meta class field widget override
in your Form::

      class Meta:

        widgets = {
          'field_name': JsonKVWidget
        }

==========================
Get Developing!
==========================
Checkout the code:

.. code-block:: bash

   git clone https://lab.redlattice.com/products/django-json-kv-widget

==========================
To Generate the Pip Installable Package
==========================

.. code-block:: bash

    python setup.py sdist
