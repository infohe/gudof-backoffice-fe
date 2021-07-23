import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, gql, useQuery } from '@apollo/client';
import { FormBuilder } from '@ginkgo-bioworks/react-json-schema-form-builder';
import { useDrawerDispatch } from 'context/DrawerContext';
import { Scrollbars } from 'react-custom-scrollbars';
import Uploader from 'components/Uploader/Uploader';
import Input from 'components/Input/Input';
import Select from 'components/Select/Select';
import Button, { KIND } from 'components/Button/Button';
import DrawerBox from 'components/DrawerBox/DrawerBox';
import { Row, Col } from 'components/FlexBox/FlexBox';
import {
  Form,
  DrawerTitleWrapper,
  DrawerTitle,
  FieldDetails,
  ButtonGroup,
} from '../DrawerItems/DrawerItems.style';
import { FormFields, FormLabel } from 'components/FormFields/FormFields';

const GET_CATEGORIES = gql`
query{
  allCategory{
    _id
    image,
    name,
    products,
    updatedAt
  }
}
`;
const CREATE_CATEGORY = gql`
  mutation createCategory($category: CreateCategoryInput!) {
    createCategory(createCategoryInput: $category) {
      _id
      image,
      name,
      products,
      updatedAt
    }
  }
`;

const CREATE_TEMPLATE = gql`
  mutation createTemplate($template: CreateTemplateInput!) {
    createTemplate(creatTemplateInput: $template) {
      _id,
      name,
      category_id,
      formSchema
    }
  }
`
const GET_TEMPLATE = gql`
    query   {
        allTemplate{
            _id,
            name,
            category_id,
            formSchema
        }
    }
`;

const options = [
  { value: 'grocery', name: 'Grocery', id: '1' },
  { value: 'women-cloths', name: 'Women Cloths', id: '2' },
  { value: 'bags', name: 'Bags', id: '3' },
  { value: 'makeup', name: 'Makeup', id: '4' },
];
type Props = any;

const AddCategory: React.FC<Props> = (props) => {
  const dispatch = useDrawerDispatch();
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  const { register, handleSubmit, setValue } = useForm();
  const [category, setCategory] = useState('');
  const [schema, setSchema] = React.useState('{}');
  const [uischema, setUiSchema] = React.useState('{}');
  React.useEffect(() => {
    register({ name: 'parent' });
    register({ name: 'image' });
  }, [register]);
  const [createNewTemplate] = useMutation(CREATE_TEMPLATE,
    {
      update(cache, { data: { createNewTemplate } }) {
        const { allTemplate } = cache.readQuery({
          query: GET_TEMPLATE,
        });
        cache.writeQuery({
          query: GET_CATEGORIES,
          data: { allTemplate: allTemplate.concat([createNewTemplate]) },
        });

      },
      onError(error) {
        console.log(error)

      }
    })
  const [createCategory] = useMutation(CREATE_CATEGORY,
    {
      update(cache, { data: { createCategory } }) {
        const { allCategory } = cache.readQuery({
          query: GET_CATEGORIES,
        });
        cache.writeQuery({
          query: GET_CATEGORIES,
          data: { allCategory: allCategory.concat([createCategory]) },
        });
      },
      onCompleted(data) {
        const newTemplate = {
          category_id: data.createCategory._id,
          name: data.createCategory.name + '-Template',
          formSchema: JSON.stringify(schema),
        }
        console.log(newTemplate);
        createNewTemplate({
          variables: { template: newTemplate },
        })
      },
      onError(error) {
        console.log(error)
      }
    }
  );

  const onSubmit = ({ name, path, parent, image }) => {
    const newCategory = {
      name: name,
      parentId: parent ? parent : null,
      path: path === '' ? '/' + name : path,
      image: image ? image : 'no-image',
      products: 0
    };
    createCategory({
      variables: { category: newCategory },
    });
    closeDrawer();
  };
  const handleChange = ({ value }) => {
    setValue('parent', value);
    setCategory(value);
  };
  const handleUploader = (files) => {
    setValue('image', files[0].path ? files[0].path : 'no-image');
  };

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Add Category</DrawerTitle>
      </DrawerTitleWrapper>

      <Form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
        <Scrollbars
          autoHide
          renderView={(props) => (
            <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />
          )}
          renderTrackHorizontal={(props) => (
            <div
              {...props}
              style={{ display: 'none' }}
              className="track-horizontal"
            />
          )}
        >
          <Row>
            <Col lg={4}>
              <FieldDetails>Upload your Category image here</FieldDetails>
            </Col>
            <Col lg={8}>
              <DrawerBox
                overrides={{
                  Block: {
                    style: {
                      width: '100%',
                      height: 'auto',
                      padding: '30px',
                      borderRadius: '3px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  },
                }}
              >
                <Uploader onChange={handleUploader} />
              </DrawerBox>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <FieldDetails>
                Add your category description and necessary informations from
                here
              </FieldDetails>
            </Col>

            <Col lg={8}>
              <DrawerBox>
                <FormFields>
                  <FormLabel>Category Name</FormLabel>
                  <Input
                    inputRef={register({ required: true, maxLength: 20 })}
                    name="name"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Path</FormLabel>
                  <Input
                    inputRef={register({ pattern: /^[A-Za-z]+$/i })}
                    name="path"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Parent</FormLabel>
                  <Select
                    options={options}
                    labelKey="name"
                    valueKey="value"
                    placeholder="Ex: Choose parent category"
                    value={category}
                    searchable={false}
                    onChange={handleChange}
                    overrides={{
                      Placeholder: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      DropdownListItem: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      OptionContent: {
                        style: ({ $theme, $selected }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $selected
                              ? $theme.colors.textDark
                              : $theme.colors.textNormal,
                          };
                        },
                      },
                      SingleValue: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      Popover: {
                        props: {
                          overrides: {
                            Body: {
                              style: { zIndex: 5 },
                            },
                          },
                        },
                      },
                    }}
                  />
                </FormFields>
              </DrawerBox>
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <FieldDetails>
                Add template Details
              </FieldDetails>
            </Col>
            <Col lg={12}>
              <DrawerBox>
                <FormBuilder
                  schema={schema}
                  uischema={uischema}
                  onChange={(newSchema: string, newUiSchema: string) => {
                    setSchema(newSchema);
                    setUiSchema(newUiSchema)
                  }}
                />
              </DrawerBox>
            </Col>
          </Row>
        </Scrollbars>

        <ButtonGroup>
          <Button
            kind={KIND.minimal}
            onClick={closeDrawer}
            overrides={{
              BaseButton: {
                style: ({ $theme }) => ({
                  width: '50%',
                  borderTopLeftRadius: '3px',
                  borderTopRightRadius: '3px',
                  borderBottomRightRadius: '3px',
                  borderBottomLeftRadius: '3px',
                  marginRight: '15px',
                  color: $theme.colors.red400,
                }),
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            overrides={{
              BaseButton: {
                style: ({ $theme }) => ({
                  width: '50%',
                  borderTopLeftRadius: '3px',
                  borderTopRightRadius: '3px',
                  borderBottomRightRadius: '3px',
                  borderBottomLeftRadius: '3px',
                }),
              },
            }}
          >
            Create Category
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default AddCategory;