===================
Json KV widget
===================
.. image:: images/Example.png
.. note::
    This is currently a Work-In-Progress.  There are many things that need to be
    reworked...but it is usable.  In particular:

    - The inline modifications in jsTree should be redone as proper plugins if possible.
    - Move css style for folder and keys out of types plugin usage in json_kv_widget.js
      - Let it be specified strictly in css file.
    - Fixing the text being typed being white on a white background when editing values
    - Aligning the keys and values in a better manner.

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

.. code-block:: python

    [{"key":"value"},{"folder1":[{"key1":"value1"},{"key2":"value2"}]},{"folder2":[]}]

Valid but will be converted:

.. code-block:: python

    [{"key":"value"},{"folder1":{"key1":"value1","key2":"value2"}},{"folder2":[]}]


In order to use this Widget:

- The Django Model Field should be a text based one or JSON field.
- The Django Model Field should be given a default value of an empty array '[]'
- Use the standard Meta class field widget-override method in your Form::

      class Meta:

        widgets = {
          'field_name': JsonKVWidget
        }

==========================
Get Developing!
==========================
Checkout the code:

.. code-block:: bash

   git clone https://github.com/rabidcicada/django_json_kv_widget

==========================
To Generate the Pip Installable Package
==========================

.. code-block:: bash

    python setup.py sdist

==========================
To Generate the Docs
==========================


Sphinx will integrate AUTHORS if it has already been created at the top level.

Install Dev Dependencies AND perform a local editable installation
then:

.. code-block:: bash

    cd docs
    make html

The need for a local editable installation is because we use setuptools_scm in
our sphinx config.

- https://github.com/pypa/setuptools_scm#usage-from-sphinx

==========================
References
==========================

For Sphinx documentation:

- http://www.sphinx-doc.org/en/master/usage/quickstart.html

For Restructured Text within the context of Sphinx:

- http://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html

For Learning about setuptools, distutils (Specifically setuptools setup.cfg)

- https://setuptools.readthedocs.io/en/latest/setuptools.html
- https://setuptools.readthedocs.io/en/latest/setuptools.html#configuring-setup-using-setup-cfg-files
